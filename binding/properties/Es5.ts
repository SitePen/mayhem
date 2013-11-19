/// <reference path="../interfaces.ts" />

import lang = require('dojo/_base/lang');
import array = require('dojo/_base/array');
import Property = require('./Property');
import util = require('../../util');
import BindingError = require('../BindingError');

class Es5Property extends Property implements IBoundProperty {
	static test(object:Object, binding:string):boolean {
		if (!Object.getOwnPropertyDescriptor) {
			return false;
		}

		var descriptor = Object.getOwnPropertyDescriptor(object, binding);
		return descriptor ? descriptor.configurable : Object.isExtensible(object);
	}

	private _object:Object;
	private _property:string;
	private _value:any;

	constructor(object:Object, binding:string) {
		super(object, binding);

		this._object = object;
		this._property = binding;

		var value = object[binding],
			descriptor = Object.getOwnPropertyDescriptor(object, binding),
			newDescriptor:PropertyDescriptor = {
				enumerable: descriptor ? descriptor.enumerable : true,
				configurable: descriptor ? descriptor.configurable : true
			};

		if (descriptor && !('value' in descriptor)) {
			newDescriptor.get = descriptor.get;

			if (!descriptor.set) {
				// TODO: Correct data to BindingError
				throw new BindingError('Cannot bind to a read-only property');
			}
			else {
				newDescriptor.set = function (newValue) {
					descriptor.set.apply(this, arguments);
					self._update(descriptor.get ? descriptor.get.call(this) : newValue);
				};
			}
		}
		else {
			newDescriptor.get = function () {
				return self._value;
			};
			newDescriptor.set = function (value) {
				self._update(value);
			};
		}

		Object.defineProperty(object, binding, newDescriptor);
		this._update(value);

		return {
			remove: function () {
				this.remove = function () {};
				Object.defineProperty(kwArgs.source, kwArgs.sourceBinding, descriptor);
				descriptor = kwArgs = null;
			}
		};
	}

	private _update(value:any):void {
		this._value = value;
		this._target && this._target.set(value);
	}

	get():any {
		return this._value;
	}

	set(value:any):void {
		this._object[this._property] = value;
	}

	bindTo(target:IBoundProperty):IHandle {

	}

	destroy():void {

	}
}
