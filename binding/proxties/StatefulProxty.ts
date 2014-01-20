import array = require('dojo/_base/array');
import binding = require('../interfaces');
import BindingProxty = require('../BindingProxty');
import core = require('../../interfaces');
import lang = require('dojo/_base/lang');
import Stateful = require('dojo/Stateful');
import util = require('../../util');

/**
 * This property binder enables the ability to bind to Dojo 1 Stateful objects.
 */
class StatefulProxty<SourceT, TargetT> extends BindingProxty<SourceT, TargetT> implements binding.IProxty<SourceT, TargetT> {
	static test(kwArgs:binding.IProxtyArguments):boolean {
		var object = <Stateful> kwArgs.object;
		return object != null && typeof object.get === 'function' &&
			typeof object.set === 'function' &&
			typeof object.watch === 'function';
	}

	/**
	 * The watch handle for the bound object.
	 */
	private _handle:IHandle;

	/**
	 * The object containing the final property to be bound.
	 */
	private _object:Stateful;

	/**
	 * The key for the final property to be bound.
	 */
	private _property:string;

	/**
	 * The target property.
	 */
	private _target:core.IProxty<TargetT>;

	constructor(kwArgs:binding.IProxtyArguments) {
		super(kwArgs);

		var object = this._object = <Stateful> kwArgs.object;
		this._property = kwArgs.binding;

		this._handle = object.watch(kwArgs.binding, (key:string, oldValue:any, newValue:any) => {
			this._update(newValue);
		});
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

	/**
	 * Gets the current value of this property.
	 */
	get():SourceT {
		return this._object ? this._object.get(this._property) : undefined;
	}

	/**
	 * Sets the value of this property. This is intended to be used to update the value of this property from another
	 * bound property and so will not be propagated to the target object, if one exists.
	 */
	set(value:SourceT):void {
		if (util.isEqual(this.get(), value)) {
			return;
		}

		this._object && this._object.set(this._property, value);
	}

	/**
	 * Updates the bound target property with the given value.
	 */
	private _update(value:TargetT):void {
		this._target && this._target.set(value);
	}
}

export = StatefulProxty;
