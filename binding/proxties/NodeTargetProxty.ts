import binding = require('../interfaces');
import BindingProxty = require('../BindingProxty');
import core = require('../../interfaces');
import util = require('../../util');

/**
 * This property binder enables the ability to bind to DOM Nodes (as a binding target only).
 */
class NodeTargetProxty<T> extends BindingProxty<T, T> implements binding.IProxty<T, T> {
	static test(kwArgs:binding.IProxtyArguments):boolean {
		return kwArgs.object instanceof Node;
	}

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

		this._object = <Node> kwArgs.object;
		this._property = kwArgs.binding;
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

		this._object = this._target = null;
	}

	/**
	 * Gets the current value of this property.
	 */
	get():T {
		// Special syntax to reference an attribute explicitly
		if (!this._object) {
			return undefined;
		}
		if (this._property.charAt(0) === '@') {
			var value = (<any> this._object).getAttribute(this._property.substr(1));
			if (value === '') {
				return true;
			}
			if (value == null) {
				return undefined;
			}
			return value;
		}
		return this._object[this._property];
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
			// Special syntax to reference an attribute explicitly
			if (this._property.charAt(0) === '@') {
				var name = this._property.substr(1);
				if (value) {
					(<any> this._object).setAttribute(name, value === true ? '' : value);
				}
				else {
					(<any> this._object).removeAttribute(name);
				}
			}
			else {
				this._object[this._property] = value;
			}
		}
	}
}

export = NodeTargetProxty;
