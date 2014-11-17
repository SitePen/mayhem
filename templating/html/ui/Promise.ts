import MultiNodeWidget = require('../../../ui/dom/MultiNodeWidget');
import Promise = require('../../../Promise');
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

class PromiseWidget<T> extends MultiNodeWidget {
	private _fulfilled:View;
	private _pending:View;
	private _value:Promise<T>;
	private _rejected:View;

	get:PromiseWidget.Getters<T>;
	on:PromiseWidget.Events;
	set:PromiseWidget.Setters<T>;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'value' ], '_render');
		super(kwArgs);
	}

	_valueGetter():Promise<T> {
		return this._value;
	}
	_valueSetter(value:T):void;
	_valueSetter(value:Promise<T>):void;
	_valueSetter(value:any):void {
		this._value = Promise.resolve<T>(value);
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

	_pendingGetter():View {
		return this._pending;
	}
	_pendingSetter:(value:View) => void;

	_rejectedGetter():View {
		return this._rejected;
	}
	_rejectedSetter:(value:View) => void;

	_fulfilledGetter():View {
		return this._fulfilled;
	}
	_fulfilledSetter:(value:View) => void;
}

PromiseWidget.prototype._pendingSetter = createSetter('_pending');
PromiseWidget.prototype._rejectedSetter = createSetter('_rejected');
PromiseWidget.prototype._fulfilledSetter = createSetter('_fulfilled');

module PromiseWidget {
	export interface Events extends MultiNodeWidget.Events {}
	export interface Getters<T> extends MultiNodeWidget.Getters {
		(key:'pending'):View;
		(key:'value'):Promise<T>;
		(key:'rejected'):View;
		(key:'resolved'):View;
	}
	export interface Setters<T> extends MultiNodeWidget.Setters {
		(key:'pending', value:View):void;
		(key:'value', value:T):void;
		(key:'value', value:Promise<T>):void;
		(key:'rejected', value:View):void;
		(key:'resolved', value:View):void;
	}
}

export = PromiseWidget;
