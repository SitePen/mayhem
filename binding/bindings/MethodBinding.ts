/// <reference path="../../dojo" />

import binding = require('../interfaces');
import Binding = require('../Binding');
import core = require('../../interfaces');
import when = require('dojo/when');

var methodExpression:RegExp = /^(.*?)\((.*)\)$/;

/**
 * The MethodBinding class enables pseudo-global functions to be registered that can be used in a binding to transform
 * the target value of a bound property.
 *
 * @example
 * Registering and using a method binding to convert a string to upper-case:
 *
 * ```ts
 * MethodBinding.methods['toUpperCase'] = function (value:string):string {
 *   return String(value).toUpperCase();
 * };
 *
 * var binding:CompositeBinding = new MethodBinding({
 *   object: { foo: 'bar' },
 *   path: 'toUpperCase(foo)', // target binding will be set to `'BAR'`
 *   binder: binder
 * });
 * ```
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

	/**
	 * The mutator function to use to transform source value to target value.
	 */
	private _mutator:(value:SourceT) => TargetT;

	/**
	 * The source binding.
	 */
	private _source:binding.IBinding<SourceT, SourceT>;

	/**
	 * The target binding.
	 */
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
