import binding = require('../interfaces');
import Binding = require('../Binding');
import core = require('../../interfaces');
import has = require('../../has');
import util = require('../../util');

/**
 * The ObjectTargetBinding enables the use of any object as the target of a binding in all EcmaScript environments.
 * This binding is only necessary when attempting to run in pre-EcmaScript 5 environments, or when attempting to bind
 * to a host object in WebKit browsers impacted by https://code.google.com/p/chromium/issues/detail?id=43394.
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

	destroy():void {
		this.destroy = function ():void {};
		this._object = this._target = null;
	}

	get():T {
		return this._object ? this._object[this._property] : undefined;
	}

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
