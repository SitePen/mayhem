/// <reference path="../interfaces.ts" />
/// <reference path="../../dojo.d.ts" />

import Property = require('./Property');
import lang = require('dojo/_base/lang');
import when = require('dojo/when');

var methodExpression:RegExp = /^(.*?)\((.*)\)$/;

class MethodProperty extends Property implements IBoundProperty {
	static methods:{ [name:string]: Function } = {};
	static test(kwArgs:IPropertyBinderArguments):boolean {
		var matches:string[];
		return Boolean((matches = methodExpression.exec(kwArgs.binding)) && this.methods[matches[1]]);
	}

	private _mutator:Function;
	private _source:IBoundProperty;
	private _target:IBoundProperty;

	constructor(kwArgs:IPropertyBinderArguments) {
		super(kwArgs);

		var matches:string[] = methodExpression.exec(kwArgs.binding);

		this._mutator = MethodProperty.methods[matches[1]];
		this._source = kwArgs.registry.createProperty(kwArgs.object, matches[2], { scheduled: false });

		var self = this;
		this._source.bindTo(<IBoundProperty> {
			set: function (value:any):void {
				self._target && self._target.set(self._mutator(value));
			}
		});
	}

	get():any {
		return this._source ? this._mutator(this._source.get()) : undefined;
	}

	set(value:any):void {
		this._source && this._source.set(value);
	}

	bindTo(target:IBoundProperty):IHandle {
		this._target = target;

		if (!target) {
			return;
		}

		target.set(this.get());

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
}

export = MethodProperty;