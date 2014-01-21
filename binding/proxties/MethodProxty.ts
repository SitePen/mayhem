/// <reference path="../../dojo.d.ts" />

import binding = require('../interfaces');
import BindingProxty = require('../BindingProxty');
import core = require('../../interfaces');

var methodExpression:RegExp = /^(.*?)\((.*)\)$/;

/**
 * This property binder adds the ability to register methods that can be used to transform the value of a bound
 * property when its value is set on its bound target.
 */
class MethodProxty<SourceT, TargetT> extends BindingProxty<any, TargetT> implements binding.IProxty<any, TargetT> {
	/**
	 * The map of available transformation methods.
	 */
	static methods:{ [name:string]:(value:any) => any; } = {};
	static test(kwArgs:binding.IProxtyArguments):boolean {
		var matches:RegExpExecArray;
		return Boolean((matches = methodExpression.exec(kwArgs.binding)) && this.methods[matches[1]]);
	}

	private _mutator:(value:SourceT) => TargetT;
	private _source:binding.IProxty<SourceT, SourceT>;
	private _target:core.IProxty<TargetT>;

	constructor(kwArgs:binding.IProxtyArguments) {
		super(kwArgs);

		var matches:RegExpExecArray = methodExpression.exec(kwArgs.binding);

		this._mutator = (<typeof MethodProxty> this.constructor).methods[matches[1]];
		this._source = kwArgs.binder.createProxty<SourceT, SourceT>(kwArgs.object, matches[2], { scheduled: false });

		var self = this;
		this._source.bindTo(<core.IProxty<SourceT>> {
			set: function (value:SourceT):void {
				self._target && self._target.set(self._mutator(value));
			}
		});
	}

	bindTo(target:core.IProxty<TargetT>, options:binding.IBindToOptions = {}):IHandle {
		this._target = target;

		if (!target) {
			return;
		}

		if (options.setValue !== false) {
			target.set(this.get());
		}

		var self = this;
		return {
			remove: function () {
				this.remove = function () {};
				self = self._target = null;
			}
		};
	}

	destroy():void {
		this.destroy = function () {};

		this._source.destroy();
		this._source = this._mutator = this._target = null;
	}

	get():TargetT {
		return this._mutator(this._source.get());
	}

	set(value:SourceT):void {
		this._source.set(value);
	}
}

export = MethodProxty;
