/**
 * The HTML templating engine loader.
 *
 * @module mayhem/templating/html
 */

import arrayUtil = require('dojo/_base/array');
import binding = require('../binding/interfaces');
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
	__bindingHandles:{ [key:string]:binding.IBindingHandle; };

	/**
	 * @private
	 */
	__modelHandle:IHandle;

	/**
	 * @private
	 */
	__parentModelHandle:IHandle;

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
	_parentGetter():Widget;

	/**
	 * @protected
	 */
	_parentSetter(value:Widget):void;
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
		this.__bindingHandles = this.__bindingHandles || {};

		var self = this;
		// TODO: __modelHandle should not be necessary unless having the observer intact during destruction causes
		// problems; test!
		this.__modelHandle = this.observe('model', function (value:Object):void {
			value = value || {};

			var bindingHandles:{ [key:string]:binding.IBindingHandle; } = self.__bindingHandles;
			for (var key in bindingHandles) {
				bindingHandles[key] && bindingHandles[key].setSource(value);
			}
		});
	};

	Ctor.prototype.destroy = function ():void {
		for (var key in this.__bindingHandles) {
			this.__bindingHandles[key].remove();
		}

		this.__modelHandle.remove();
		this.__parentModelHandle && this.__parentModelHandle.remove();
		this.__modelHandle = this.__parentModelHandle = this.__bindingHandles = this._model = null;
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
		this.__parentModelHandle && this.__parentModelHandle.remove();
		this.__parentModelHandle = null;
		this._model = value;
	};

	Ctor.prototype._parentSetter = function (value:Widget):void {
		this.__parentModelHandle && this.__parentModelHandle.remove();
		this.__parentModelHandle = null;

		var oldModel:Object = this._parent && this._parent.get('model');
		this._parent = value;

		if (!this._model) {
			this._notify('model', value && value.get('model'), oldModel);
			if (value) {
				var self = this;
				this.__parentModelHandle = value.observe('model', function (newValue:Object, oldValue:Object):void {
					self._notify('model', newValue, oldValue);
				});
			}
		}
	};

	Ctor.prototype._parentGetter = function ():Widget {
		return this._parent;
	};

	Ctor.prototype.set = function (key:any, value?:any):void {
		if (typeof key === 'string' && /^on[A-Z]/.test(key)) {
			var eventName:string = key.charAt(2).toLowerCase() + key.slice(3);

			if (value && value.$bind !== undefined) {
				if (this.__bindingHandles[key]) {
					this.__bindingHandles[key].setSource(this.get('model') || {}, value.$bind);
				}
				else {
					var binder:binding.IBinder = this._app.get('binder');
					var binding:binding.IBinding<Function>;
					var rebind = function (object:Object, path:string = value.$bind):void {
						binding && binding.destroy();
						binding = binder.createBinding<Function>(object || {}, path, { useScheduler: false });
					};

					rebind(this.get('model'));

					var handle:IHandle = this.on(eventName, function ():void {
						var listener:Function = binding.get();
						if (typeof listener === 'function') {
							return listener.apply(binding.getObject(), arguments);
						}
					});

					this.__bindingHandles[key] = {
						setSource: rebind,
						remove: function ():void {
							this.remove = function () {};
							binding.destroy();
							handle.remove();
							binder = value = binding = handle = null;
						}
					};
				}
			}
			else {
				this.on(eventName, function ():void {
					if (this[value]) {
						return this[value].apply(self, arguments);
					}
				});
			}
		}
		// TODO: $bind should provide both object and path?
		else if (value && value.$bind !== undefined) {
			// TODO: Composite arrays should get to here and be made up of strings and { path: 'binding' } objects, not
			// { $bind: 'binding' } objects
			if (value.$bind instanceof Array) {
				value.$bind = arrayUtil.map(value.$bind, function (item:any):any {
					if (item.$bind) {
						return { path: item.$bind };
					}

					return item;
				});
			}

			// TODO: Need a way to hook from property changes that are widget-induced back to the view model
			if (this.__bindingHandles[key]) {
				this.__bindingHandles[key].setSource(this.get('model') || {}, value.$bind);
			}
			else {
				this.__bindingHandles[key] = this._app.get('binder').bind({
					source: this.get('model') || {},
					sourcePath: value.$bind,
					target: this,
					targetPath: key,
					direction: value.direction
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

			var value:any = node instanceof Array ? [] : {};

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

export function createFromFile(filename:string):IPromise<WidgetConstructor> {
	return util.getModule('dojo/text!' + filename).then(function (template:string):IPromise<WidgetConstructor> {
		return create(template);
	});
}

/**
 * Implementation of the AMD Loader Plugin API.
 *
 * @param resourceId The path to the template.
 * @param require Context-specific require.
 * @param load Callback function passed a templated widget constructor.
 */
export function load(resourceId:string, _:typeof require, load:(value:WidgetConstructor) => void):void {
	createFromFile(resourceId).then(load);
}

export function normalize(resourceId:string, normalize:(id:string) => string):string {
	if (!/\.html(?:$|\?)/.test(resourceId)) {
		return normalize(resourceId.replace(/(\?|$)/, '.html$1'));
	}

	return normalize(resourceId);
}
