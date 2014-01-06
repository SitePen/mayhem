/// <reference path="../../dojo.d.ts" />

import binding = require('../interfaces');
import lang = require('dojo/_base/lang');
import Property = require('./Property');
import when = require('dojo/when');

var methodExpression:RegExp = /^(.*?)\((.*)\)$/;

/**
 * This property binder adds the ability to register methods that can be used to transform the value of a bound
 * property when its value is set on its bound target.
 */
class MethodProperty extends Property implements binding.IBoundProperty {
	/**
	 * The map of available transformation methods.
	 */
	static methods:{ [name:string]: (value:any) => any } = {};
	static test(kwArgs:binding.IPropertyBinderArguments):boolean {
		var matches:RegExpExecArray;
		return Boolean((matches = methodExpression.exec(kwArgs.binding)) && this.methods[matches[1]]);
	}

	private _mutator:Function;
	private _source:binding.IBoundProperty;
	private _target:binding.IBoundProperty;

	constructor(kwArgs:binding.IPropertyBinderArguments) {
		super(kwArgs);

		var matches:RegExpExecArray = methodExpression.exec(kwArgs.binding);

		this._mutator = MethodProperty.methods[matches[1]];
		this._source = kwArgs.registry.createProperty(kwArgs.object, matches[2], { scheduled: false });

		var self = this;
		this._source.bindTo(<binding.IBoundProperty> {
			set: function (value:any):void {
				self._target && self._target.set(self._mutator(value));
			}
		});
	}

	bindTo(target:binding.IBoundProperty, options:binding.IBoundPropertyOptions = {}):IHandle {
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

	get():any {
		return this._source ? this._mutator(this._source.get()) : undefined;
	}

	set(value:any):void {
		this._source && this._source.set(value);
	}
}

export = MethodProperty;
