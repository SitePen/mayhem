import binding = require('../interfaces');
import Binding = require('../Binding');
import util = require('../../util');

/**
 * The ObjectTargetBinding enables the use of any object as the target of a binding in all EcmaScript environments.
 * This binding is only necessary when attempting to run in pre-EcmaScript 5 environments, or when attempting to bind
 * to a host object in WebKit browsers impacted by https://code.google.com/p/chromium/issues/detail?id=43394.
 */
class ObjectTargetBinding<T> extends Binding<T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		return util.isObject(kwArgs.object) && typeof kwArgs.path === 'string';
	}

	/**
	 * The object containing the final property to be bound.
	 * @protected
	 */
	// Uses `any` type since this code uses arbitrary properties
	_object:any;

	/**
	 * The key for the final property to be bound.
	 * @protected
	 */
	_property:string;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		this._object = kwArgs.object;
		this._property = kwArgs.path;
	}

	destroy():void {
		super.destroy();
		this._object = this._property = null;
	}

	get():T {
		return this._object ? this._object[this._property] : undefined;
	}

	getObject():{} {
		return this._object;
	}

	set(value:T):void {
		if (this._object && !util.isEqual(this.get(), value)) {
			this._object[this._property] = value;
		}
	}
}

export = ObjectTargetBinding;
