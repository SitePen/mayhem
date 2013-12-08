/// <reference path="../../dojo.d.ts" />

import array = require('dojo/_base/array');
import binding = require('../interfaces');
import has = require('../../has');
import lang = require('dojo/_base/lang');
import Property = require('./Property');
import util = require('../../util');

class Es5Property extends Property implements binding.IBoundProperty {
	static test(kwArgs:binding.IPropertyBinderArguments):boolean {
		if (!has('es5') || !util.isObject(kwArgs.object)) {
			return false;
		}

		var descriptor = Object.getOwnPropertyDescriptor(kwArgs.object, kwArgs.binding);
		return descriptor ? descriptor.configurable && ('value' in descriptor || 'set' in descriptor) :
			Object.isExtensible(kwArgs.object);
	}

	private _object:Object;
	private _originalDescriptor:PropertyDescriptor;
	private _property:string;
	private _target:binding.IBoundProperty;

	constructor(kwArgs:binding.IPropertyBinderArguments) {
		super(kwArgs);

		var object = kwArgs.object,
			binding = kwArgs.binding;

		this._object = object;
		this._property = binding;

		var self = this,
			value = object[binding],
			descriptor = this._originalDescriptor = Object.getOwnPropertyDescriptor(object, binding),
			newDescriptor:PropertyDescriptor = {
				enumerable: descriptor ? descriptor.enumerable : true,
				configurable: descriptor ? descriptor.configurable : true
			};

		if (descriptor && !('value' in descriptor)) {
			newDescriptor.get = descriptor.get;

			if (!descriptor.set) {
				// TODO: Correct data to BindingError
				throw new Error('Binding to a read-only property is not possible because this binder does not support computed properties');
			}
			else {
				newDescriptor.set = function (newValue) {
					descriptor.set.apply(this, arguments);
					descriptor.get && self._update(descriptor.get.call(this));
				};
			}
		}
		else {
			newDescriptor.get = function () {
				return value;
			};
			newDescriptor.set = function (newValue) {
				value = newValue;
				self._update(newValue);
			};
		}

		Object.defineProperty(object, binding, newDescriptor);
		this._update(value);
	}

	bindTo(target:binding.IBoundProperty):IHandle {
		this._target = target;

		if (!target) {
			return;
		}

		target.set(this._object[this._property]);

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

		var descriptor = this._originalDescriptor || {
			value: this._object[this._property],
			writable: true,
			enumerable: true,
			configurable: true
		};

		Object.defineProperty(this._object, this._property, descriptor);
		this._originalDescriptor = this._object = this._target = null;
	}

	get():any {
		return this._object ? this._object[this._property] : undefined;
	}

	set(value:any):void {
		this._object && (this._object[this._property] = value);
	}

	private _update(value:any):void {
		this._target && this._target.set(value);
	}
}

export = Es5Property;
