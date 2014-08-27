/**
 * The HTML templating engine loader.
 *
 * @module mayhem/templating/html
 */

import BindDirection = require('../binding/BindDirection');
import binding = require('../binding/interfaces');
import Container = require('../ui/dom/Container');
import lang = require('dojo/_base/lang');
import parser = require('./html/peg/html');
import templating = require('./interfaces');
import util = require('../util');
import Widget = require('../ui/dom/Widget');

// TODO: This function typically comes from TypeScript itself so is available everywhere, but its use here is a hack.
declare function __extends(d:WidgetConstructor, b:WidgetConstructor):WidgetConstructor;

export interface WidgetConstructor {
	new (kwArgs?:HashMap<any>):BindableWidget;
	prototype:BindableWidget;
}

/**
 * The BindableWidget interface defines a widget that can hold reference to a model object to bind to.
 * TODO: Move this interface
 */
export interface BindableWidget extends Widget {
	/**
	 * @protected
	 */
	_bindingHandles:{ [key:string]:binding.IBindingHandle; };

	/**
	 * @private
	 */
	_modelHandle:IHandle;

	/**
	 * @private
	 */
	_parentModelHandle:IHandle;

	/**
	 * @protected
	 */
	_modelGetter():Object;

	/**
	 * @protected
	 */
	_modelSetter(value:Object):void;

	/**
	 * @protected
	 */
	_parentSetter(value:Container):void;
}

/**
 * This method augments a normal Widget constructor with added functionality necessary for data binding properties from
 * the template.
 *
 * @param BaseCtor A Widget constructor.
 * @returns A BindableWidget constructor.
 */
function addBindings(BaseCtor:WidgetConstructor):WidgetConstructor {
	var Ctor:WidgetConstructor = <any> function (kwArgs?:HashMap<any>):void {
		// The app property is needed early by the overridden `set` function, which will try to access the data binder
		// when a $bind object is passed
		this._app = kwArgs['app'];
		BaseCtor.call(this, kwArgs);
	};

	__extends(Ctor, BaseCtor);

	Ctor.prototype._initialize = function ():void {
		BaseCtor.prototype._initialize.call(this);
		// Element subclass extends binding handles as an array instead of an object
		this._bindingHandles = this._bindingHandles || {};

		var self = this;
		// TODO: _modelHandle should not be necessary unless having the observer intact during destruction causes
		// problems; test!
		this._modelHandle = this.observe('model', function (value:Object):void {
			var bindingHandles:{ [key:string]:binding.IBindingHandle; } = self._bindingHandles;
			for (var key in bindingHandles) {
				bindingHandles[key] && bindingHandles[key].setSource(value);
			}
		});
	};

	Ctor.prototype.destroy = function ():void {
		for (var key in this._bindingHandles) {
			this._bindingHandles[key].remove();
		}

		this._modelHandle.remove();
		this._parentModelHandle && this._parentModelHandle.remove();
		this._modelHandle = this._parentModelHandle = this._bindingHandles = this._model = null;
		BaseCtor.prototype.destroy.call(this);
	};

	// TODO: Need a way of identifying this as a computed property for the purpose of being able to have bindings
	// correctly update when the parent model updates, instead of using hacky parent/model observation
	Ctor.prototype._modelGetter = function ():Object {
		if (this._model) {
			return this._model;
		}

		return this._parent && this._parent.get('model');
	};

	Ctor.prototype._modelSetter = function (value:Object):void {
		this._parentModelHandle && this._parentModelHandle.remove();
		this._parentModelHandle = null;
		this._model = value;
	};

	Ctor.prototype._parentSetter = function (value:Container):void {
		this._parentModelHandle && this._parentModelHandle.remove();
		this._parentModelHandle = null;

		if (!this._model) {
			this._notify('model', value && value.get('model'), this._parent && this._parent.get('model'));
			if (value) {
				var self = this;
				this._parentModelHandle = value.observe('model', function (newValue:Object, oldValue:Object):void {
					self._notify('model', newValue, oldValue);
				});
			}
		}

		this._parent = value;
	};

	Ctor.prototype.set = function (key:any, value?:any):void {
		if (typeof key === 'string' && /^on[A-Z]/.test(key)) {
			var eventName:string = key.charAt(2).toLowerCase() + key.slice(3);

			if (value && value.$bind !== undefined) {
				if (this._bindingHandles[key]) {
					this._bindingHandles[key].setSource(this.get('model') || {}, value.$bind);
				}
				else {
					var listener:Function;
					var binder:binding.IBinder = this._app.get('binder');
					var binding:binding.IBinding<Function, Function>;
					var rebind = function (object:Object, path:string = value.$bind):void {
						binding && binding.destroy();
						binding = binder.createBinding<Function, Function>(object || {}, path, { schedule: false });
						binding.bindTo(<binding.IBinding<Function, void>> {
							set: function (newValue:Function):void {
								listener = newValue;
							}
						});
					};

					rebind(this.get('model'));

					var handle:IHandle = this.on(eventName, function ():void {
						// TODO: Update binding API to allow getting a reference to the parent object from the binding
						// so the correct context can be used when invoking bound methods
						typeof listener === 'function' && listener.apply(null, arguments);
					});

					this._bindingHandles[key] = {
						setSource: rebind,
						remove: function ():void {
							this.remove = function ():void {};
							binding.destroy();
							handle.remove();
							binder = value = binding = handle = null;
						}
					};
				}
			}
			else {
				this.on(eventName, function ():void {
					var model:Object = this.get('model');
					model[value] && model[value].apply(model, arguments);
				});
			}
		}
		// TODO: $bind should provide both object and path?
		else if (value && value.$bind !== undefined) {
			// TODO: Need a way to hook from property changes that are widget-induced back to the view model
			if (this._bindingHandles[key]) {
				this._bindingHandles[key].setSource(this.get('model') || {}, value.$bind);
			}
			else {
				this._bindingHandles[key] = this._app.get('binder').bind({
					source: this.get('model') || {},
					sourcePath: value.$bind,
					target: this,
					targetPath: key,
					direction: BindDirection.TWO_WAY
				});
			}
		}
		else {
			BaseCtor.prototype.set.call(this, key, value);
		}
	};

	return Ctor;
}

/**
 * A cache of generated BindableWidget constructors.
 */
var boundConstructors:{ [moduleId:string]:WidgetConstructor; } = {};

/**
 * Instantiates a widget.
 *
 * @param Ctor The constructor to use.
 * @param kwArgs The arguments to pass to the constructor.
 * @returns A BindableWidget instance.
 */
function instantiate(Ctor:WidgetConstructor, kwArgs:HashMap<any>):Widget;
function instantiate(Ctor:string, kwArgs:HashMap<any>):Widget;
function instantiate(Ctor:any, kwArgs:HashMap<any>):Widget {
	if (typeof Ctor === 'string') {
		Ctor = boundConstructors[Ctor] = (boundConstructors[Ctor] || addBindings(<WidgetConstructor> require(<string> Ctor)));
	}

	return new (<WidgetConstructor> Ctor)(kwArgs);
}

/**
 * Creates a BindableWidget constructor from a template AST node.
 *
 * @param root The AST node to use as the root node for the constructed widget.
 * @returns A constructor that instantiates a composed view tree based on the contents of the AST.
 */
function createViewConstructor(root:templating.INode):WidgetConstructor {
	return <any> function (kwArgs?:HashMap<any>):Widget {
		var staticArgs:HashMap<any> = (function visit(node:templating.INode, parent?:templating.INode):any {
			if (typeof node !== 'object') {
				return node;
			}

			var value:HashMap<any> = node instanceof Array ? [] : {};

			// If the object is a special constructor token object, then it should actually be converted into a
			// constructor function, not an instance
			if (node.$ctor) {
				return createViewConstructor(node.$ctor);
			}

			for (var key in node) {
				if (key === 'constructor') {
					continue;
				}

				value[key] = visit(node[key], node);
			}

			// If there is no parent, this is a root node, which will get constructed separately since it receives the
			// keywords arguments from the constructor call; otherwise, if the value of `node.constructor` is not the
			// Object or Array constructors, this node is a typed object instance that needs to be converted into a
			// typed object
			if (node.constructor && <any> node.constructor !== value.constructor && parent) {
				value['app'] = kwArgs['app'];
				value = instantiate(node.constructor, value);
			}

			return value;
		})(root);

		return instantiate(root.constructor, lang.mixin(staticArgs, kwArgs));
	};
}

/**
 * Creates a Widget constructor from an HTML template.
 *
 * @param template A Mayhem HTML template.
 * @returns A promise that resolves to an BindableWidget constructor.
 */
export function create(template:string):IPromise<WidgetConstructor> {
	var ast:templating.IParseTree = parser.parse(template);
	return util.getModules(ast.constructors).then(function ():WidgetConstructor {
		return createViewConstructor(ast.root);
	});
}

/**
 * Implementation of the AMD Loader Plugin API.
 *
 * @param resourceId The path to the template.
 * @param require Context-specific require.
 * @param load Callback function passed a templated widget constructor.
 */
export function load(resourceId:string, require:typeof require, load:(value:WidgetConstructor) => void):void {
	util.getModule('dojo/text!' + resourceId).then(function (template:string):void {
		create(template).then(load);
	});
}

export function normalize(resourceId:string, normalize:(id:string) => string):string {
	if (!/\.html(?:$|\?)/.test(resourceId)) {
		return normalize(resourceId.replace(/(\?|$)/, '.html$1'));
	}

	return normalize(resourceId);
}
