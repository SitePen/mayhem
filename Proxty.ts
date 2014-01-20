/// <reference path="./dojo" />

import core = require('./interfaces');
import util = require('./util');

class Proxty<T> implements core.IProxty<T> {
	isProxty:boolean;
	private _observers:core.IObserver<T>[];
	private _value:T;

	constructor(initialValue:T) {
		this._observers = [];
		this._value = initialValue;
	}

	destroy():void {
		this._observers = this._value = null;
	}

	get():T {
		return this._value;
	}

	private _notifyObservers(newValue:T, oldValue:T):void {
		for (var i = 0, observer:core.IObserver<T>; (observer = this._observers[i]); ++i) {
			observer(newValue, oldValue);
		}
	}

	observe(observer:core.IObserver<T>):IHandle {
		this._observers.push(observer);
		var self = this;
		return {
			remove: function () {
				this.remove = function () {};
				util.spliceMatch(self._observers, observer);
				self = observer = null;
			}
		};
	}

	set(value:T):void {
		var oldValue:T = this._value;

		// TODO: Probably necessary, but breaks the ability to just re-set ModelProxty `errors` with the same array,
		// so `errors` should probably be a stateful array.
		/* if (util.isEqual(oldValue, value)) {
			return;
		}*/

		this._value = value;
		this._notifyObservers(value, oldValue);
	}

	toString():string {
		return '' + this.get();
	}

	valueOf():T {
		var value = this.get();
		return value && (<T> value.valueOf());
	}
}
Proxty.prototype.isProxty = true;

export = Proxty;
