import binding = require('../interfaces');
import Binding = require('../Binding');
import core = require('../../interfaces');
import has = require('../../has');
import util = require('../../util');

/**
 * This property binder enables the ability to bind to arbitrary Objects (as a binding target only).
 */
class ObjectTargetBinding<T> extends Binding<T, T> implements binding.IBinding<T, T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		return util.isObject(kwArgs.object) && typeof kwArgs.path === 'string';
	}

	/**
	 * The object containing the final property to be bound.
	 */
	private _object:Object;

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

		this._object = kwArgs.object;
		this._property = kwArgs.path;
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
		this._object = this._target = null;
	}

	/**
	 * Gets the current value of this property.
	 */
	get():T {
		return this._object ? this._object[this._property] : undefined;
	}

	/**
	 * Sets the value of this property. This is intended to be used to update the value of this property from another
	 * bound property and so will not be propagated to the target object, if one exists.
	 */
	set(value:T):void {
		if (util.isEqual(this.get(), value)) {
			return;
		}

		if (this._object) {
			this._object[this._property] = value;
		}
	}
}

export = ObjectTargetBinding;
