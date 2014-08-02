/// <reference path="../../dojo" />

import binding = require('../interfaces');
import Binding = require('../Binding');
import BindingError = require('../BindingError');
import core = require('../../interfaces');
import has = require('../../has');
import util = require('../../util');

/**
 * This property binder enables the ability to bind directly to properties of plain JavaScript objects in environments
 * that support EcmaScript 5.
 */
class Es5Binding<T> extends Binding<T, T> implements binding.IBinding<T, T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		if (!has('es5') || !util.isObject(kwArgs.object) || typeof kwArgs.path !== 'string' ||
			// TODO: This is a hack to avoid using the ES5 binder with DOM nodes since when the descriptor of these
			// objects is replaced, they stop updating. Need to figure out why DOM nodes with getter/setter properties
			// return property descriptors with only a value property and no get/set methods
			typeof Node !== 'undefined' && kwArgs.object instanceof Node
		) {
			return false;
		}

		var descriptor = Object.getOwnPropertyDescriptor(kwArgs.object, kwArgs.path);
		return descriptor ? descriptor.configurable && ('value' in descriptor || 'set' in descriptor) :
			Object.isExtensible(kwArgs.object);
	}

	private _object:Object;
	private _originalDescriptor:PropertyDescriptor;
	private _property:string;
	private _target:binding.IBinding<T, T>;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var self = this;
		var object = kwArgs.object;
		var property = kwArgs.path;

		this._object = object;
		this._property = property;

		var value = object[property];
		var descriptor = this._originalDescriptor = Object.getOwnPropertyDescriptor(object, property);
		var newDescriptor:PropertyDescriptor = {
			enumerable: descriptor ? descriptor.enumerable : true,
			configurable: descriptor ? descriptor.configurable : true
		};

		if (descriptor && !('value' in descriptor)) {
			newDescriptor.get = descriptor.get;

			if (!descriptor.set) {
				// TODO: Correct data to BindingError
				throw new BindingError('Binding to a read-only property is not possible because this binder does not support computed properties', kwArgs);
			}
			else {
				newDescriptor.set = function (newValue:T):void {
					descriptor.set.apply(this, arguments);
					descriptor.get && self._update(descriptor.get.call(this));
				};
			}
		}
		else {
			newDescriptor.get = function ():T {
				return value;
			};
			newDescriptor.set = function (newValue:T):void {
				value = newValue;
				self._update(newValue);
			};
		}

		Object.defineProperty(object, property, newDescriptor);
		this._update(value);
	}

	bindTo(target:binding.IBinding<T, T>, options:binding.IBindToOptions = {}):IHandle {
		this._target = target;

		if (!target) {
			return;
		}

		if (options.setValue !== false) {
			target.set(this._object[this._property]);
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

		// TODO: This breaks if there were multiple bindings to the same property; subsequent bindings will be lost
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
		this._target && this._target.set(value);
	}
}

export = Es5Binding;
