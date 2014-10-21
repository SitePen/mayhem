/// <reference path="../../dojo" />

import binding = require('../interfaces');
import Binding = require('../Binding');
import util = require('../../util');

class ObjectMethodBinding<T> extends Binding<T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		return util.isObject(kwArgs.object) && typeof kwArgs.path === 'string' && kwArgs.path.indexOf('(') !== -1;
	}

	private _args:any[];
	private _binding:binding.IBinding<Function>;
	private _fn:Function;
	private _object:any;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var callee:RegExpExecArray = /^([^(]*)\((.*)\)$/.exec(kwArgs.path);

		this._object = kwArgs.object;

		var self = this;
		this._binding = kwArgs.binder.createBinding<any>(kwArgs.object, callee[1], { useScheduler: false });
		this._binding.observe(function (change:binding.IChangeRecord<Function>):void {
			self._fn = change.value;
			self.notify({ value: self.get() });
		});
		this._fn = this._binding.get();

		// TODO: Violates CSP, does not allow bindings to be used in arguments
		this._args = callee[2] ? new Function('return [' + callee[2] + '];')() : [];
	}

	destroy():void {
		super.destroy();
		this._binding.destroy();
		this._args = this._binding = this._fn = this._object = null;
	}

	get():T {
		return this._fn ? this._fn.apply(this._object, this._args) : undefined;
	}
}

export = ObjectMethodBinding;
