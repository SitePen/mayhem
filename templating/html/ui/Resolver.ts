import MultiNodeWidget = require('../../../ui/dom/MultiNodeWidget');
import Promise = require('../../../Promise');
import View = require('../../../ui/dom/View');

function createSetter(property:string):(value:View) => void {
	return function (value:View):void {
		if (this[property].get('isAttached')) {
			this.remove(this[property]);
			value.set('model', this[property].get('model'));
			this.add(value);
		}

		this[property] = value;
	};
}

class Resolver<T> extends MultiNodeWidget {
	private _pending:View;
	private _promise:Promise<T>;
	private _rejected:View;
	private _resolved:View;

	get:Resolver.Getters<T>;
	on:Resolver.Events;
	set:Resolver.Setters<T>;

	_promiseSetter(value:Promise<T>):void {
		this._promise = value;

		if (this._pending) {
			this._lastNode.parentNode.insertBefore(this._pending.detach(), this._lastNode);
		}

		var self = this;
		Promise.resolve(value).then(function (value:T):void {
			self._pending && self._pending.detach();
			if (self._resolved) {
				self._resolved.set('model', value);
				self._lastNode.parentNode.insertBefore(self._resolved.detach(), self._lastNode);
			}
		}, function (error:Error):void {
			self._pending && self._pending.detach();
			if (self._rejected) {
				self._rejected.set('model', error);
				self._lastNode.parentNode.insertBefore(self._rejected.detach(), self._lastNode);
			}
		}, function (progress:any):void {
			self._pending && self._pending.set('model', progress);
		});
	}

	_pendingSetter:(value:View) => void;
	_rejectedSetter:(value:View) => void;
	_resolvedSetter:(value:View) => void;
}

Resolver.prototype._pendingSetter = createSetter('_pending');
Resolver.prototype._rejectedSetter = createSetter('_rejected');
Resolver.prototype._resolvedSetter = createSetter('_resolved');

module Resolver {
	export interface Events extends MultiNodeWidget.Events {}
	export interface Getters<T> extends MultiNodeWidget.Getters {
		(key:'pending'):View;
		(key:'promise'):Promise<T>;
		(key:'rejected'):View;
		(key:'resolved'):View;
	}
	export interface Setters<T> extends MultiNodeWidget.Setters {
		(key:'pending', value:View):void;
		(key:'promise', value:Promise<T>):void;
		(key:'rejected', value:View):void;
		(key:'resolved', value:View):void;
	}
}

export = Resolver;
