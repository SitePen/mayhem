/// <reference path="../../dojo" />

import array = require('dojo/_base/array');
import binding = require('../interfaces');
import Binding = require('../Binding');
import core = require('../../interfaces');
import lang = require('dojo/_base/lang');
import Stateful = require('dojo/Stateful');
import util = require('../../util');

/**
 * The StatefulBinding class enables binding to Dojo 1 {@link external:dojo/Stateful} objects.
 */
class StatefulBinding<T> extends Binding<T, T> implements binding.IBinding<T, T> {
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

	/**
	 * The target property.
	 */
	private _target:binding.IBinding<T, T>;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var object = this._object = <Stateful> kwArgs.object;
		this._property = kwArgs.path;

		this._handle = object.watch(kwArgs.path, (key:string, oldValue:any, newValue:any):void => {
			this._update(newValue);
		});
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

		this._handle.remove();
		this._handle = this._object = this._target = null;
	}

	get():T {
		return this._object ? this._object.get(this._property) : undefined;
	}

	set(value:T):void {
		if (this._object) {
			if (util.isEqual(this.get(), value)) {
				return;
			}

			this._object.set(this._property, value);
		}
	}

	private _update(value:T):void {
		this._target && this._target.set(value);
	}
}

export = StatefulBinding;
