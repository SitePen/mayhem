/// <reference path="../../dojo" />

import binding = require('../interfaces');
import Binding = require('../Binding');
import BindingError = require('../BindingError');
import core = require('../../interfaces');
import has = require('../../has');
import util = require('../../util');

has.add('webidl-bad-descriptors', function ():boolean {
	var element:HTMLDivElement = arguments[2];
	return Boolean(element && Object.getOwnPropertyDescriptor(element, 'nodeValue') != null);
});

/**
 * Retrieves a property descriptor from the given object or any of its inherited prototypes.
 *
 * @param object The object on which to look for the property.
 * @param property The name of the property.
 * @returns The property descriptor.
 * @private
 */
function getAnyPropertyDescriptor(object:Object, property:string):PropertyDescriptor {
	var descriptor:PropertyDescriptor;
	do {
		descriptor = Object.getOwnPropertyDescriptor(object, property);
	} while (!descriptor && (object = Object.getPrototypeOf(object)));

	return descriptor;
}

/**
 * The Es5Binding class enables two-way binding directly to properties of plain JavaScript objects in EcmaScript 5+
 * environments.
 */
class Es5Binding<T> extends Binding<T, T> implements binding.IBinding<T, T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		if (!has('es5') || !util.isObject(kwArgs.object) || typeof kwArgs.path !== 'string' ||
			// https://code.google.com/p/chromium/issues/detail?id=43394
			(has('webidl-bad-descriptors') && typeof Node !== 'undefined' && kwArgs.object instanceof Node)
		) {
			return false;
		}

		var descriptor = Object.getOwnPropertyDescriptor(kwArgs.object, kwArgs.path);
		return descriptor ? descriptor.configurable && ('value' in descriptor || 'set' in descriptor) :
			Object.isExtensible(kwArgs.object);
	}

	/**
	 * The bound object.
	 */
	private _object:Object;

	/**
	 * The original property descriptor for the bound object.
	 */
	private _originalDescriptor:PropertyDescriptor;

	/**
	 * The property descriptor generated for this binding.
	 */
	private _ownDescriptor:PropertyDescriptor;

	/**
	 * The name of the property to bind on the source object.
	 */
	private _property:string;

	/**
	 * The target binding.
	 */
	private _target:binding.IBinding<T, T>;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var self = this;
		var object = kwArgs.object;
		var property = kwArgs.path;

		this._object = object;
		this._property = property;

		var value = object[property];
		var descriptor = this._originalDescriptor = getAnyPropertyDescriptor(object, property);
		var newDescriptor:PropertyDescriptor = {
			enumerable: descriptor ? descriptor.enumerable : true,
			configurable: descriptor ? descriptor.configurable : true
		};

		if (descriptor && (descriptor.get || descriptor.set)) {
			newDescriptor.get = descriptor.get;
			newDescriptor.set = descriptor.get ? function (newValue:T):void {
				descriptor.set && descriptor.set.apply(this, arguments);
				self._update && self._update(descriptor.get.call(this));
			} : descriptor.set;
		}
		else {
			newDescriptor.get = function ():T {
				return value;
			};
			newDescriptor.set = function (newValue:T):void {
				value = newValue;
				self._update && self._update(newValue);
			};
		}

		Object.defineProperty(object, property, newDescriptor);
		this._ownDescriptor = newDescriptor;
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

		// We can only replace the property's descriptor with the old one as long as we are in control of the
		// descriptor; if another binding was made to the same property after us, then the descriptor functions will not
		// be ours and we would incorrectly destroy the other bindings. If we are not in control, once `this._update` is
		// null, our descriptor ends up functioning as a simple pass-through
		var currentDescriptor:PropertyDescriptor = Object.getOwnPropertyDescriptor(this._object, this._property);
		if (currentDescriptor.get === this._ownDescriptor.get && currentDescriptor.set === this._ownDescriptor.set) {
			var descriptor = this._originalDescriptor || {
				value: this._object[this._property],
				writable: true,
				enumerable: true,
				configurable: true
			};

			Object.defineProperty(this._object, this._property, descriptor);
		}

		this._update = this._ownDescriptor = this._originalDescriptor = this._object = this._property = this._target = null;
	}

	get():T {
		return this._object ? this._object[this._property] : undefined;
	}

	set(value:T):void {
		this._object && (this._object[this._property] = value);
	}

	/**
	 * Updates the bound target property with the given value.
	 */
	private _update(value:T):void {
		this._target && this._target.set(value);
	}
}

export = Es5Binding;
