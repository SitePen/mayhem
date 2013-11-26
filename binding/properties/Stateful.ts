/// <reference path="../interfaces.ts" />

import lang = require('dojo/_base/lang');
import array = require('dojo/_base/array');
import Property = require('./Property');
import util = require('../../util');

class StatefulProperty extends Property implements IBoundProperty {
	static test(kwArgs:IPropertyBinderArguments):boolean {
		var object = <IStateful> kwArgs.object;
		return Boolean(object != null && typeof object.get === 'function' &&
			typeof object.set === 'function' &&
			typeof object.watch === 'function');
	}

	/**
	 * The object containing the final property to be bound.
	 */
	private _object:IStateful;

	/**
	 * The key for the final property to be bound.
	 */
	private _property:string;

	/**
	 * The target property.
	 */
	private _target:IBoundProperty;

	/**
	 * The watch handle for the bound object.
	 */
	private _handle:IHandle;

	constructor(kwArgs:IPropertyBinderArguments) {
		super(kwArgs);

		var object = this._object = <IStateful> kwArgs.object;
		this._property = kwArgs.binding;

		this._handle = object.watch(kwArgs.binding, (key:string, oldValue:any, newValue:any) => {
			this._update(newValue);
		});
	}

	/**
	 * Updates the bound target property with the given value.
	 */
	private _update(value:any):void {
		this._target && this._target.set(value);
	}

	/**
	 * Gets the current value of this property.
	 */
	get():any {
		return this._object ? this._object.get(this._property) : undefined;
	}

	/**
	 * Sets the value of this property. This is intended to be used to update the value of this property from another
	 * bound property and so will not be propagated to the target object, if one exists.
	 */
	set(value:any):void {
		if (util.isEqual(this.get(), value)) {
			return;
		}

		this._object && this._object.set(this._property, value);
	}

	/**
	 * Sets the target property to bind to. The target will have its value reset immediately upon binding.
	 */
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

	/**
	 * Destroys the property binding.
	 */
	destroy():void {
		this.destroy = function () {};

		this._handle.remove();
		this._handle = this._object = this._target = null;
	}
}

export = StatefulProperty;
