import BindDirection = require('../binding/BindDirection');
import binding = require('../binding/interfaces');
import Container = require('../ui/dom/Container');
import lang = require('dojo/_base/lang');
import parser = require('./html/peg/html');
import templating = require('./interfaces');
import util = require('../util');
import Widget = require('../ui/dom/Widget');

interface WidgetConstructor {
	new (kwArgs?:HashMap<any>):BindableWidget;
}

interface BindableWidget extends Widget {
	/**
	 * @protected
	 */
	_bindingHandles:{ [key:string]:binding.IBindingHandle; };

	/**
	 * @protected
	 */
	_modelGetter():Object;

	/**
	 * @protected
	 */
	_modelSetter(value:Object):void;
}

declare function __extends(d:WidgetConstructor, b:WidgetConstructor):WidgetConstructor;
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
		this.observe('model', function (value:Object):void {
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

		this._bindingHandles = this._model = null;
		BaseCtor.prototype.destroy.call(this);
	};

	// TODO: Need a way of identifying this as a computed property for the purpose of being able to have bindings
	// correctly update when the parent model updates
	Ctor.prototype._modelGetter = function ():Object {
		if (this._model) {
			return this._model;
		}

		return this._parent && this._parent.get('model');
	};

	Ctor.prototype._parentSetter = function (value:Container):void {
		if (!this._model) {
			this._notify(value && value.get('model'), this._parent && this._parent.get('model'), 'model');
			// TODO: fix this to not leak
			var self = this;
			value.observe('model', function (newValue:Object, oldValue:Object):void {
				self._notify(newValue, oldValue, 'model');
			});
		}

		this._parent = value;
	};

	Ctor.prototype.set = function (key:any, value?:any):void {
		// TODO: $bind should provide both object and path?
		if (value && value.$bind !== undefined) {
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

			return;
		}

		return BaseCtor.prototype.set.call(this, key, value);
	};

	return Ctor;
}

var boundConstructors:{ [moduleId:string]:WidgetConstructor; } = {};

function instantiate(Ctor:WidgetConstructor, kwArgs:HashMap<any>):Widget;
function instantiate(Ctor:string, kwArgs:HashMap<any>):Widget;
function instantiate(Ctor:any, kwArgs:HashMap<any>):Widget {
	if (typeof Ctor === 'string') {
		Ctor = boundConstructors[Ctor] = (boundConstructors[Ctor] || addBindings(<WidgetConstructor> require(<string> Ctor)));
	}

	return new (<WidgetConstructor> Ctor)(kwArgs);
}

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
				node = node.$ctor;
				return (function (staticArgs:HashMap<any>):WidgetConstructor {
					return <any> function (kwArgs?:HashMap<any>):Widget {
						return instantiate(node.constructor, lang.mixin({}, staticArgs, kwArgs));
					};
				})(visit(node, null));
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

export function load(resourceId:string, require:typeof require, load:(value:typeof Widget) => void):void {
	util.getModule('dojo/text!' + resourceId).then(function (template:string):void {
		var ast:templating.IParseTree = parser.parse(template);
		util.getModules(ast.constructors).then(function ():void {
			load(createViewConstructor(ast.root));
		});
	});
}
