import MultiNodeWidget = require('../../../ui/dom/MultiNodeWidget');
import CorePromise = require('../../../Promise');
import View = require('../../../ui/View');
import util = require('../../../util');

function createSetter(property:string):(value:View) => void {
	return function (value:View):void {
		if (this[property] && this[property].get('isAttached')) {
			this.remove(this[property]);
			value.set('model', this[property].get('model'));
			this.add(value);
		}

		this[property] = value;
	};
}

class Promise<T> extends MultiNodeWidget {
	private _fulfilled:View;
	private _pending:View;
	private _value:CorePromise<T>;
	private _rejected:View;

	get:Promise.Getters<T>;
	on:Promise.Events;
	set:Promise.Setters<T>;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'value' ], '_render');
		super(kwArgs);
	}

	_valueSetter(value:T):void;
	_valueSetter(value:CorePromise<T>):void;
	_valueSetter(value:any):void {
		this._value = CorePromise.resolve<T>(value);
		var self = this;

		if (!this._value.isResolved()) {
			this._fulfilled.detach();
		}
		if (this._rejected && !this._value.isRejected()) {
			this._rejected.detach();
		}
		if (!this._value.isFulfilled() && this._pending) {
			this._lastNode.parentNode.insertBefore(this._pending.detach(), this._lastNode);
		}

		this._value.always(function (value:T):T {
			if (self._pending) {
				self._pending.detach();
			}

			if (value instanceof Error) {
				throw value;
			}
			else {
				return value;
			}
		}).then(
			function (value:T):void {
				if (self._fulfilled) {
					self._fulfilled.set('model', value);
					self._lastNode.parentNode.insertBefore(self._fulfilled.detach(), self._lastNode);
				}
			},
			function (error:Error):void {
				if (self._rejected) {
					self._rejected.set('model', error);
					self._lastNode.parentNode.insertBefore(self._rejected.detach(), self._lastNode);
				}
			},
			this._value.isFulfilled() ? null : function (progress:any):void {
				if (self._pending) {
					self._pending.set('model', progress);
				}
			}
		);
	}

	_pendingSetter:(value:View) => void;
	_rejectedSetter:(value:View) => void;
	_fulfilledSetter:(value:View) => void;
}

Promise.prototype._pendingSetter = createSetter('_pending');
Promise.prototype._rejectedSetter = createSetter('_rejected');
Promise.prototype._fulfilledSetter = createSetter('_fulfilled');

module Promise {
	export interface Events extends MultiNodeWidget.Events {}
	export interface Getters<T> extends MultiNodeWidget.Getters {
		(key:'pending'):View;
		(key:'value'):CorePromise<T>;
		(key:'rejected'):View;
		(key:'resolved'):View;
	}
	export interface Setters<T> extends MultiNodeWidget.Setters {
		(key:'pending', value:View):void;
		(key:'value', value:T):void;
		(key:'value', value:CorePromise<T>):void;
		(key:'rejected', value:View):void;
		(key:'resolved', value:View):void;
	}
}

export = Promise;
