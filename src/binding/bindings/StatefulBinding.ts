import binding = require('../interfaces');
import Binding = require('../Binding');
import Stateful = require('dojo/Stateful');
import util = require('../../util');

/**
 * The StatefulBinding class enables binding to Dojo 1 {@link external:dojo/Stateful} objects.
 */
class StatefulBinding<T> extends Binding<T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		var object = <Stateful> kwArgs.object;
		return object != null && typeof object.get === 'function' &&
			typeof object.set === 'function' &&
			typeof object.watch === 'function' &&
			typeof kwArgs.path === 'string';
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

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var object = this._object = <Stateful> kwArgs.object;
		this._property = kwArgs.path;

		var self = this;
		this._handle = object.watch(kwArgs.path, function (key:string, oldValue:any, newValue:any):void {
			// Stateful does not check equality of set values and will redispatch when old and new values are the same
			if (!util.isEqual(newValue, oldValue)) {
				self.notify({ value: newValue, oldValue: oldValue });
			}
		});
	}

	destroy():void {
		super.destroy();
		this._handle.remove();
		this._handle = this._object = this._property = null;
	}

	get():T {
		return this._object ? this._object.get(this._property) : undefined;
	}

	getObject():{} {
		return this._object;
	}

	set(value:T):void {
		if (this._object) {
			if (util.isEqual(this.get(), value)) {
				return;
			}

			this._object.set(this._property, value);
		}
	}
}

export = StatefulBinding;
