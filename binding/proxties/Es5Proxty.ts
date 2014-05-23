/// <reference path="../../dojo" />

import binding = require('../interfaces');
import BindingProxty = require('../BindingProxty');
import core = require('../../interfaces');
import has = require('../../has');
import util = require('../../util');
import when = require('dojo/when');

/**
 * This property binder enables the ability to bind directly to properties of plain JavaScript objects in environments
 * that support EcmaScript 5.
 */
class Es5Proxty<T> extends BindingProxty<T, T> implements binding.IProxty<T, T> {
	static test(kwArgs:binding.IProxtyArguments):boolean {
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
	private _target:core.IProxty<T>;

	constructor(kwArgs:binding.IProxtyArguments) {
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

	bindTo(target:core.IProxty<T>, options:binding.IBindToOptions = {}):IHandle {
		this._target = target;

		if (!target) {
			return;
		}

		if (options.setValue !== false) {
			target.set(this._object[this._property]);
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

		var descriptor = this._originalDescriptor || {
			value: this._object[this._property],
			writable: true,
			enumerable: true,
			configurable: true
		};

		Object.defineProperty(this._object, this._property, descriptor);
		this._originalDescriptor = this._object = this._target = null;
	}

	get():T {
		return this._object ? this._object[this._property] : undefined;
	}

	set(value:T):void {
		this._object && (this._object[this._property] = value);
	}

	private _update(value:T):void {
		when(value).then((value:T):void => {
			this._target && this._target.set(value);
		});
	}
}

export = Es5Proxty;
