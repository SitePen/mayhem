/// <reference path="../interfaces.ts" />

import lang = require('dojo/_base/lang');
import array = require('dojo/_base/array');
import Property = require('./Property');
import util = require('../../util');

class StatefulProperty extends Property implements IBoundProperty {
	static test(kwArgs:IPropertyBinderArguments):boolean {
		var object = kwArgs.object;
		return Boolean(object && typeof object['get'] === 'function' &&
			typeof object['set'] === 'function' &&
			typeof object['watch'] === 'function');
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
	 * The last set value of the property.
	 */
	private _value:any;

	/**
	 * The target property.
	 */
	private _target:IBoundProperty;

	/**
	 * The string that identifies the sub-property to be bound.
	 */
	private _binding:string[];

	/**
	 * The watch handles for each binding.
	 */
	private _bindingHandles:IHandle[] = [];

	constructor(kwArgs:IPropertyBinderArguments) {
		super(kwArgs);

		this._binding = kwArgs.binding.split('.');
		this._property = this._binding[this._binding.length - 1];
		this._rebind(<IStateful> kwArgs.object, 0);
	}

	/**
	 * Removes and rebinds to all objects in the object chain.
	 * TODO: This mechanism should delegate to the registry so chains of mixed objects can be bound instead.
	 */
	private _rebind(fromObject:IStateful, fromIndex:number):void {
		var self = this,
			handles = this._bindingHandles;

		// Stop watching objects that are no longer part of this binding's object chain because a parent object
		// was replaced
		array.forEach(handles.splice(fromIndex), function (handle) {
			handle.remove();
		});

		// If any of the intermediate objects between `object` and the property we are actually binding
		// change, we need to rebind the entire object chain starting from the changed object
		for (
			var key:string,
				index = fromIndex,
				object = fromObject;
			(key = this._binding[index]) && index < this._binding.length - 1 && object;
			++index
		) {
			if (typeof object.watch !== 'function') {
				throw new Error('Object is not Stateful');
			}

			handles.push(object.watch(key, <(key, oldValue, newValue) => void>
				lang.hitch(this, function (index, key, oldValue, newValue) {
					// If the watched key changes, rebind starting from that new object
					this._rebind(newValue, index + 1);
				}, index)));

			if (!(object = object.get(key))) {
				// If there is no object here, we cannot rebind any further; presumably, at some point in
				// the future, an object will exist here and then binding can continue
				break;
			}
		}

		// If `object` exists, it will be the final object in the chain, the one on which we are actually looking
		// for values
		var value:any;
		if (object) {
			if (typeof object.watch !== 'function') {
				throw new Error('Object is not Stateful');
			}

			// If the values on this final object change we only need to update the value, not rebind
			// any intermediate objects
			handles.push(object.watch(key, <(key, oldValue, newValue) => void>
				lang.hitch(this, function (key, oldValue, newValue) {
					self._update(newValue);
				})));

			value = object.get(key);
		}

		this._object = object;
		this._update(value);
	}

	/**
	 * Updates the bound target property with the given value.
	 */
	private _update(value:any):void {
		this._value = value;
		this._target && this._target.set(value);
	}

	/**
	 * Gets the current value of this property.
	 */
	get():any {
		return this._value;
	}

	/**
	 * Sets the value of this property. This is intended to be used to update the value of this property from another
	 * bound property and so will not be propagated to the target object, if one exists.
	 */
	set(value:any):void {
		if (util.isEqual(this._value, value)) {
			return;
		}

		this._value = value;
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

		target.set(this._value);

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

		var handles = this._bindingHandles;
		for (var i = 0, handle:IHandle; (handle = handles[i]); ++i) {
			handle.remove();
		}

		this._object = this._target = null;
		this._value = undefined;
	}
}

export = StatefulProperty;
