/// <reference path="../../dojo" />

import array = require('dojo/_base/array');
import binding = require('../interfaces');
import BindingProxty = require('../BindingProxty');
import core = require('../../interfaces');
import lang = require('dojo/_base/lang');
import util = require('../../util');

/**
 * This property binder adds the ability to bind to arbitrarily deep children of the source object, including
 * properties that may not yet exist at the time the object is initially bound.
 */
class NestedProxty<SourceT, TargetT> extends BindingProxty<SourceT, TargetT> implements binding.IProxty<SourceT, TargetT> {
	static test(kwArgs:binding.IProxtyArguments):boolean {
		return kwArgs.object != null && kwArgs.binding && kwArgs.binding.indexOf('.') !== -1;
	}

	/**
	 * The binder to bind sub-properties with.
	 */
	private _binder:binding.IBinder;

	/**
	 * The string that identifies the sub-property to be bound.
	 */
	private _binding:string[];

	/**
	 * The watch handles for each binding.
	 */
	private _proxties:binding.IProxty<any, any>[] = [];

	/**
	 * The property at the end of the bound chain of properties.
	 */
	private _source:binding.IProxty<SourceT, SourceT>;

	/**
	 * The target property.
	 */
	private _target:core.IProxty<TargetT>;

	constructor(kwArgs:binding.IProxtyArguments) {
		super(kwArgs);

		this._binder = kwArgs.binder;
		this._binding = kwArgs.binding.split('.');
		this._rebind(kwArgs.object, 0);
	}

	/**
	 * Sets the target property to bind to. The target will have its value reset immediately upon binding.
	 */
	bindTo(target:core.IProxty<TargetT>, options:binding.IBindToOptions = {}):IHandle {
		this._target = target;

		if (!target) {
			return;
		}

		if (options.setValue !== false) {
			target.set(<TargetT> <any> this.get());
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

		var proxties = this._proxties;
		for (var i = 0, proxty:core.IProxty<any>; (proxty = proxties[i]); ++i) {
			proxty.destroy();
		}

		this._source = this._target = null;
	}

	/**
	 * Gets the current value of this property.
	 */
	get():SourceT {
		return this._source ? this._source.get() : undefined;
	}

	/**
	 * Sets the value of this property. This is intended to be used to update the value of this property from another
	 * bound property and so will not be propagated to the target object, if one exists.
	 */
	set(value:SourceT):void {
		this._source && this._source.set(value);
	}

	/**
	 * Removes and rebinds to all objects in the object chain.
	 */
	private _rebind(fromObject:Object, fromIndex:number):void {
		var proxties = this._proxties;

		// Stop watching objects that are no longer part of this binding's object chain because a parent object
		// was replaced
		array.forEach(proxties.splice(fromIndex), function (proxty:core.IProxty<any>):void {
			proxty.destroy();
		});

		var binding:string,
			index:number = fromIndex,
			object:Object = fromObject,
			proxty:binding.IProxty<any, any>,
			initialBind:boolean = true;

		// If any of the intermediate objects between `object` and the property we are actually binding
		// change, we need to rebind the entire object chain starting from the changed object
		for (; index < this._binding.length - 1 && object; ++index) {
			binding = this._binding[index];
			proxty = this._binder.createProxty(object, binding, { scheduled: false });
			proxty.bindTo(<core.IProxty<Object>> {
				set: lang.hitch(this, function (index:number, value:Object):void {
					// The `set` method of this fake target will be immediately called by the source `property` if
					// a value exists for that property; in order to avoid this causing a premature rebinding in the
					// middle of an existing rebinding event, the `initialBind` variable is used as a guard to only
					// allow rebinding once the initial binding of the entire chain has completed
					initialBind || this._rebind(value, index + 1);
				}, index)
			});
			proxties.push(proxty);

			// If there is no object here, we cannot rebind any further; presumably, at some point in the future, an
			// object will exist here and then binding can continue
			if ((object = proxty.get()) == null) {
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
			proxty = this._binder.createProxty(object, this._binding[index], { scheduled: false });
			proxty.bindTo(<core.IProxty<TargetT>> {
				set: (value:TargetT):void => {
					this._update(value);
				}
			});
			proxties.push(proxty);
			value = proxty.get();
		}
		else {
			proxty = null;
		}

		this._source = proxty;
		this._update(value);
	}

	/**
	 * Updates the bound target property with the given value.
	 */
	private _update(value:TargetT):void {
		this._target && this._target.set(value);
	}
}

export = NestedProxty;
