/// <reference path="../../dojo.d.ts" />

import array = require('dojo/_base/array');
import binding = require('../interfaces');
import lang = require('dojo/_base/lang');
import Property = require('./Property');
import util = require('../../util');

/**
 * This property binder adds the ability to bind to arbitrarily deep children of the source object, including
 * properties that may not yet exist at the time the object is initially bound.
 */
class NestedProperty extends Property implements binding.IBoundProperty {
	static test(kwArgs:binding.IPropertyBinderArguments):boolean {
		return kwArgs.object != null && kwArgs.binding.indexOf('.') !== -1;
	}

	/**
	 * The string that identifies the sub-property to be bound.
	 */
	private _binding:string[];

	/**
	 * The watch handles for each binding.
	 */
	private _properties:binding.IBoundProperty[] = [];

	/**
	 * The property registry to bind sub-properties with.
	 */
	private _registry:binding.IPropertyRegistry;

	/**
	 * The property at the end of the bound chain of properties.
	 */
	private _source:binding.IBoundProperty;

	/**
	 * The target property.
	 */
	private _target:binding.IBoundProperty;

	constructor(kwArgs:binding.IPropertyBinderArguments) {
		super(kwArgs);

		this._registry = kwArgs.registry;
		this._binding = kwArgs.binding.split('.');
		this._rebind(kwArgs.object, 0);
	}

	/**
	 * Sets the target property to bind to. The target will have its value reset immediately upon binding.
	 */
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

	/**
	 * Destroys the property binding.
	 */
	destroy():void {
		this.destroy = function () {};

		var properties = this._properties;
		for (var i = 0, property:binding.IBoundProperty; (property = properties[i]); ++i) {
			property.destroy();
		}

		this._source = this._target = null;
	}

	/**
	 * Gets the current value of this property.
	 */
	get():any {
		return this._source ? this._source.get() : undefined;
	}

	/**
	 * Sets the value of this property. This is intended to be used to update the value of this property from another
	 * bound property and so will not be propagated to the target object, if one exists.
	 */
	set(value:any):void {
		this._source && this._source.set(value);
	}

	/**
	 * Removes and rebinds to all objects in the object chain.
	 */
	private _rebind(fromObject:Object, fromIndex:number):void {
		var properties = this._properties;

		// Stop watching objects that are no longer part of this binding's object chain because a parent object
		// was replaced
		array.forEach(properties.splice(fromIndex), function (property:binding.IBoundProperty) {
			property.destroy();
		});

		var binding:string,
			index:number = fromIndex,
			object:Object = fromObject,
			property:binding.IBoundProperty,
			initialBind:boolean = true;

		// If any of the intermediate objects between `object` and the property we are actually binding
		// change, we need to rebind the entire object chain starting from the changed object
		for (; index < this._binding.length - 1 && object; ++index) {
			binding = this._binding[index];
			property = this._registry.createProperty(object, binding, { scheduled: false });
			property.bindTo(<binding.IBoundProperty> {
				set: lang.hitch(this, function (index:number, value:Object):void {
					// The `set` method of this fake target will be immediately called by the source `property` if
					// a value exists for that property; in order to avoid this causing a premature rebinding in the
					// middle of an existing rebinding event, the `initialBind` variable is used as a guard to only
					// allow rebinding once the initial binding of the entire chain has completed
					initialBind || this._rebind(value, index + 1);
				}, index)
			});
			properties.push(property);

			// If there is no object here, we cannot rebind any further; presumably, at some point in the future, an
			// object will exist here and then binding can continue
			if ((object = property.get()) == null) {
				break;
			}
		}

		initialBind = false;

		// If `object` exists, it will be the final object in the chain, the one on which we are actually looking
		// for values
		var value:any;
		if (object) {
			// If the values on this final object change we only need to update the value, not rebind
			// any intermediate objects
			property = this._registry.createProperty(object, this._binding[index], { scheduled: false });
			property.bindTo(<binding.IBoundProperty> {
				set: (value:any):void => {
					this._update(value);
				}
			});
			properties.push(property);
			value = property.get();
		}
		else {
			property = null;
		}

		this._source = property;
		this._update(value);
	}

	/**
	 * Updates the bound target property with the given value.
	 */
	private _update(value:any):void {
		this._target && this._target.set(value);
	}
}

export = NestedProperty;