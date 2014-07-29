/// <reference path="../../dojo" />

import array = require('dojo/_base/array');
import binding = require('../interfaces');
import Binding = require('../Binding');
import core = require('../../interfaces');
import lang = require('dojo/_base/lang');
import util = require('../../util');

/**
 * This property binder enables the ability to bind to mayhem Observable objects.
 */
class ObservableBinding<T> extends Binding<T, T> implements binding.IBinding<T, T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		var object = <core.IObservable> kwArgs.object;
		return object != null && typeof object.get === 'function' &&
			typeof object.set === 'function' &&
			typeof object.observe === 'function' &&
			typeof kwArgs.path === 'string';
	}

	/**
	 * The watch handle for the bound object.
	 */
	private _handle:IHandle;

	/**
	 * The object containing the final property to be bound.
	 */
	private _object:core.IObservable;

	/**
	 * The key for the final property to be bound.
	 */
	private _property:string;

	/**
	 * The target property.
	 */
	private _target:binding.IBinding<T, T>;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var object = this._object = <core.IObservable> kwArgs.object;
		this._property = kwArgs.path;

		this._handle = object.observe(kwArgs.path, (newValue:any):void => {
			this._update(newValue);
		});
	}

	/**
	 * Sets the target property to bind to. The target will have its value reset immediately upon binding.
	 */
	bindTo(target:binding.IBinding<T, T>, options:binding.IBindToOptions = {}):IHandle {
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

	/**
	 * Destroys the property binding.
	 */
	destroy():void {
		this.destroy = function ():void {};

		this._handle.remove();
		this._handle = this._object = this._target = null;
	}

	/**
	 * Gets the current value of this property.
	 */
	get():T {
		return this._object ? <any> this._object.get(this._property) : undefined;
	}

	/**
	 * Sets the value of this property. This is intended to be used to update the value of this property from another
	 * bound property and so will not be propagated to the target object, if one exists.
	 */
	set(value:T):void {
		this._object && this._object.set(this._property, value);
	}

	/**
	 * Updates the bound target property with the given value.
	 */
	private _update(value:T):void {
		this._target && this._target.set(value);
	}
}

export = ObservableBinding;
