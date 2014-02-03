import binding = require('../interfaces');
import BindingProxty = require('../BindingProxty');
import core = require('../../interfaces');
import util = require('../../util');

/**
 * This property binder enables the ability to bind to DOM Nodes.
 */
class NodeProxty<T> extends BindingProxty<T, T> implements binding.IProxty<T, T> {
	static test(kwArgs:binding.IProxtyArguments):boolean {
		return kwArgs.object instanceof Node;
	}

	/**
	 * The watch handle for the bound object.
	 */
	private _handle:IHandle;

	/**
	 * The object containing the final property to be bound.
	 */
	private _object:Node;

	/**
	 * The key for the final property to be bound.
	 */
	private _property:string;

	/**
	 * The target property.
	 */
	private _target:core.IProxty<T>;

	constructor(kwArgs:binding.IProxtyArguments) {
		super(kwArgs);

		var object = this._object = <Node> kwArgs.object;
		this._property = kwArgs.binding;

		// TODO observation
		// this._handle = object.watch(kwArgs.binding, (key:string, oldValue:any, newValue:any) => {
		// 	this._update(newValue);
		// });
	}

	/**
	 * Sets the target property to bind to. The target will have its value reset immediately upon binding.
	 */
	bindTo(target:core.IProxty<T>, options:binding.IBindToOptions = {}):IHandle {
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

		this._handle && this._handle.remove();
		this._handle = this._object = this._target = null;
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

	/**
	 * Updates the bound target property with the given value.
	 */
	private _update(value:T):void {
		this._target && this._target.set(value);
	}
}

export = NodeProxty;
