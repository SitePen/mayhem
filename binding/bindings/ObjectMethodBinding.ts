/// <reference path="../../dojo" />

import binding = require('../interfaces');
import Binding = require('../Binding');
import util = require('../../util');

class ObjectMethodBinding<T> extends Binding<T, T> implements binding.IBinding<T, T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		return util.isObject(kwArgs.object) && typeof kwArgs.path === 'string' && kwArgs.path.indexOf('(') !== -1;
	}

	private _args:any[];
	private _binding:binding.IBinding<(...args:any[]) => any, (...args:any[]) => any>;
	private _fn:(...args:any[]) => any;
	private _object:any;
	private _target:binding.IBinding<T, T>;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var callee:RegExpExecArray = /^([^(]*)\((.*)\)$/.exec(kwArgs.path);

		this._object = kwArgs.object;

		var self = this;
		this._binding = kwArgs.binder.createBinding<any, any>(kwArgs.object, callee[1], { schedule: false });
		this._binding.observe(function (newValue:(...args:any[]) => any):void {
			self._fn = newValue;
			self._update();
		});

		this._args = callee[2] ? new Function('return [' + callee[2] + '];')() : [];

/*		if (object[path].dependencies) {
			for (var i = 0, dependency; (dependency = object[path].dependencies[i]); ++i) {
				if (typeof dependency === 'string') {
					dependency = binder.createBinding(object, dependency);
				}

				dependency.observe(function () {
					self.set(object[path]());
				});
			}
		}*/
	}

	get():T {
		return this._fn.apply(this._object, this._args);
	}

	bindTo(target:binding.IBinding<T, any>, options:binding.IBindToOptions = {}):IHandle {
		this._target = target;

		if (!target) {
			return;
		}

		if (options.setValue !== false) {
			this._update();
		}

		var self = this;
		return {
			remove: function ():void {
				this.remove = function ():void {};
				self = self._target = null;
			}
		};
	}

	destroy():void {
		this.destroy = function ():void {};
		this._binding.destroy();
		this._args = this._binding = this._fn = this._object = this._target = null;
	}

	private _update():void {
		this._target && this._target.set(this.get());
	}

	set(value:T):void {
		// TODO: Don't do this, make the `set` function optional
		throw new Error('One-way binding only');
	}
}

export = ObjectMethodBinding;
