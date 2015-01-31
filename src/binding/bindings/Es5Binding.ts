import binding = require('../interfaces');
import Binding = require('../Binding');
import has = require('../../has');
import util = require('../../util');

/**
 * Retrieves a property descriptor from the given object or any of its inherited prototypes.
 *
 * @param object The object on which to look for the property.
 * @param property The name of the property.
 * @returns The property descriptor.
 * @private
 */
function getAnyPropertyDescriptor(object:Object, property:string):PropertyDescriptor {
	var descriptor:PropertyDescriptor;
	do {
		descriptor = Object.getOwnPropertyDescriptor(object, property);
	} while (!descriptor && (object = Object.getPrototypeOf(object)));

	return descriptor;
}

/**
 * The Es5Binding class enables two-way binding directly to properties of plain JavaScript objects in EcmaScript 5+
 * environments.
 */
class Es5Binding<T> extends Binding<T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		if (!has('es5') || !util.isObject(kwArgs.object) || typeof kwArgs.path !== 'string' ||
			(has('webidl-bad-descriptors') && typeof Node !== 'undefined' && kwArgs.object instanceof Node)
		) {
			return false;
		}

		var descriptor = Object.getOwnPropertyDescriptor(kwArgs.object, kwArgs.path);
		return descriptor ? descriptor.configurable && ('value' in descriptor || 'set' in descriptor) :
			Object.isExtensible(kwArgs.object);
	}

	/**
	 * The bound object.
	 */
	// Uses `any` type since this code uses arbitrary properties
	private _object:any;

	/**
	 * The original property descriptor for the bound object.
	 */
	private _originalDescriptor:PropertyDescriptor;

	/**
	 * The property descriptor generated for this binding.
	 */
	private _ownDescriptor:PropertyDescriptor;

	/**
	 * The name of the property to bind on the source object.
	 */
	private _property:string;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var self = this;
		var object:any = kwArgs.object;
		var property = kwArgs.path;

		this._object = object;
		this._property = property;

		// TODO: Improve efficiency by adding a notification overlay to the object so these functions only ever get
		// attached once and additional binding observers can just reuse the same generated data
		var value = object[property];
		var descriptor = this._originalDescriptor = getAnyPropertyDescriptor(object, property);
		var newDescriptor:PropertyDescriptor = {
			enumerable: descriptor ? descriptor.enumerable : true,
			configurable: descriptor ? descriptor.configurable : true
		};

		if (descriptor && (descriptor.get || descriptor.set)) {
			newDescriptor.get = descriptor.get;
			newDescriptor.set = function (newValue:T):void {
				// If the binding was destroyed but the descriptor could not be fully removed because someone else
				// replaced it after us, we do not want to perform notifications, just continue to perform the original
				// operation
				if (self.notify) {
					var oldValue:T = descriptor.get ? descriptor.get.call(this) : value;

					if (descriptor.set) {
						descriptor.set.apply(this, arguments);
					}
					else {
						value = newValue;
					}

					if (descriptor.get) {
						newValue = descriptor.get.call(this);
					}

					if (!util.isEqual(oldValue, newValue)) {
						self.notify({ oldValue: oldValue, value: newValue });
					}
				}
				else if (descriptor.set) {
					descriptor.set.apply(this, arguments);
				}
			};
		}
		else {
			newDescriptor.get = function ():T {
				return value;
			};
			newDescriptor.set = function (newValue:T):void {
				var oldValue:T = value;
				value = newValue;
				// If the binding was destroyed but the descriptor could not be fully removed because someone else
				// replaced it after us, we do not want to perform notifications, just continue to perform the original
				// operation
				if (self.notify && !util.isEqual(oldValue, value)) {
					self.notify({ oldValue: oldValue, value: value });
				}
			};
		}

		Object.defineProperty(object, property, newDescriptor);
		this._ownDescriptor = newDescriptor;
	}

	destroy():void {
		super.destroy();

		// We can only replace the property's descriptor with the old one as long as we are in control of the
		// descriptor; if another binding was made to the same property after us, then the descriptor functions will not
		// be ours and we would incorrectly destroy the other bindings. If we are not in control, once `this.notify` is
		// null, our descriptor ends up functioning as a simple pass-through
		var currentDescriptor:PropertyDescriptor = Object.getOwnPropertyDescriptor(this._object, this._property);
		if (currentDescriptor.get === this._ownDescriptor.get && currentDescriptor.set === this._ownDescriptor.set) {
			var descriptor = this._originalDescriptor || {
				value: this._object[this._property],
				writable: true,
				enumerable: true,
				configurable: true
			};

			Object.defineProperty(this._object, this._property, descriptor);
		}

		this._ownDescriptor = this._originalDescriptor = this._object = this._property = this.notify = null;
	}

	get():T {
		return this._object ? this._object[this._property] : undefined;
	}

	getObject():{} {
		return this._object;
	}

	set(value:T):void {
		if (this._object) {
			this._object[this._property] = value;
		}
	}
}

export = Es5Binding;
