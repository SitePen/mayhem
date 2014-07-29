/// <reference path="../../dojo" />

import binding = require('../interfaces');
import Binding = require('../Binding');
import core = require('../../interfaces');
import when = require('dojo/when');

var methodExpression:RegExp = /^(.*?)\((.*)\)$/;

/**
 * This property binder adds the ability to register methods that can be used to transform the value of a bound
 * property when its value is set on its bound target.
 */
class MethodBinding<SourceT, TargetT> extends Binding<any, TargetT> implements binding.IBinding<any, TargetT> {
	/**
	 * The map of available transformation methods.
	 */
	static methods:{ [name:string]:(value:any) => any; } = {};
	static test(kwArgs:binding.IBindingArguments):boolean {
		var matches:RegExpExecArray;
		return Boolean((matches = methodExpression.exec(kwArgs.path)) && this.methods[matches[1]]);
	}

	private _mutator:(value:SourceT) => TargetT;
	private _source:binding.IBinding<SourceT, SourceT>;
	private _target:binding.IBinding<TargetT, TargetT>;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var matches:RegExpExecArray = methodExpression.exec(kwArgs.path);

		this._mutator = (<typeof MethodBinding> this.constructor).methods[matches[1]];
		this._source = kwArgs.binder.createBinding<SourceT, SourceT>(kwArgs.object, matches[2], { scheduled: false });

		var self = this;
		this._source.bindTo(<binding.IBinding<SourceT, SourceT>> {
			set: function (value:SourceT):void {
				self._target && self._target.set(self._mutator(value));
			}
		});
	}

	bindTo(target:binding.IBinding<TargetT, TargetT>, options:binding.IBindToOptions = {}):IHandle {
		this._target = target;

		if (!target) {
			return;
		}

		if (options.setValue !== false) {
			target.set(this.get());
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

		this._source.destroy();
		this._source = this._mutator = this._target = null;
	}

	get():TargetT {
		return this._source ? this._mutator(this._source.get()) : undefined;
	}

	set(value:SourceT):void {
		this._source.set(value);
	}
}

export = MethodBinding;
