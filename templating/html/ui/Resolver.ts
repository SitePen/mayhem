import Container = require('../../../ui/dom/Container');
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

class Resolver<T> extends Container {
	private _pending:View;
	private _promise:Promise<T>;
	private _rejected:View;
	private _resolved:View;

	get:Resolver.Getters<T>;
	on:Resolver.Events;
	set:Resolver.Setters<T>;

	_promiseSetter(value:Promise<T>):void {
		this._promise = value;

		this._pending && this.add(this._pending);

		var self = this;
		Promise.resolve(value).then(function (value:T):void {
			self._pending && self.remove(self._pending);
			if (self._resolved) {
				self._resolved.set('model', value);
				self.add(self._resolved);
			}
		}, function (error:Error):void {
			self._pending && self.remove(self._pending);
			if (self._rejected) {
				self._rejected.set('model', error);
				self.add(self._rejected);
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
	export interface Events extends Container.Events {}
	export interface Getters<T> extends Container.Getters {
		(key:'promise'):Promise<T>;
	}
	export interface Setters<T> extends Container.Setters {
		(key:'promise', value:Promise<T>):void;
	}
}

export = Resolver;
