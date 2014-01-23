/// <reference path="../../dojo" />

import binding = require('../interfaces');
import BindingProxty = require('../BindingProxty');
import core = require('../../interfaces');
import lang = require('dojo/_base/lang');
import util = require('../../util');

class ModelProxty<T> implements binding.IProxty<T, T> {
	static test(kwArgs:binding.IProxtyArguments):boolean {
		var object = <core.IModel> kwArgs.object;
		if (object && object.getProxty) {
			try {
				object.getProxty(kwArgs.binding);
			}
			catch (error) {}
		}

		return false;
	}

	get:() => T;
	private _handle:IHandle;
	id:string;
	isProxty:boolean;
	observe:(observer:core.IObserver<T>, invokeImmediately?:boolean) => IHandle;
	set:(value:T) => void;
	private _target:core.IProxty<T>;

	constructor(kwArgs:binding.IProxtyArguments) {
		var proxty:ModelProxty<T> = lang.delegate(
			<ModelProxty<T>> (<core.IModel> kwArgs.object).getProxty(kwArgs.binding),
			this.constructor.prototype
		);

		this._handle = proxty.observe((value:T) => {
			this._target && this._target.set(value);
		});
		BindingProxty.call(proxty, kwArgs);
		return proxty;
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

		this._handle.remove();
		this._handle = this._target = null;
	}
}

export = ModelProxty;
