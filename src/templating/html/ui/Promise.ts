import html = require('../../html');
import MultiNodeWidget = require('../../../ui/dom/MultiNodeWidget');
import Promise = require('../../../Promise');
import Proxy = require('../../../data/Proxy');
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
	static inheritsModel:boolean = true;

	private _as:string;
	private _fulfilled:View;
	private _pending:View;
	private _pendingAs:string;
	private _value:Promise<T>;
	private _rejected:View;
	private _rejectedAs:string;

	get:PromiseWidget.Getters<T>;
	on:PromiseWidget.Events;
	set:PromiseWidget.Setters<T>;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'value' ], '_render');
		super(kwArgs);
	}

	_initialize():void {
		super._initialize();

		this._as = 'value';
		this._pendingAs = 'progress';
		this._rejectedAs = 'error';
	}

	_valueGetter():Promise<T> {
		return this._value;
	}
	_valueSetter(value:T):void;
	_valueSetter(value:Promise<T>):void;
	_valueSetter(value:any):void {
		this._value = Promise.resolve<T>(value);
		var self = this;

		function setModel(view:View, as:string, value:any):void {
			if (!(<html.TemplatingAwareWidgetConstructor> view.constructor).inheritsModel) {
				return;
			}

			var kwArgs:HashMap<any> = {
				app: self._app,
				target: self.get('model')
			};
			kwArgs[as] = value;
			var proxy = new Proxy(kwArgs);
			view.set('model', proxy);
		}

		function attach(view:View):void {
			self._lastNode.parentNode.insertBefore(view.detach(), self._lastNode);
			view.set({
				isAttached: self.get('isAttached'),
				parent: self
			});
		}

		if (!this._value.isResolved()) {
			this._fulfilled.detach();
		}
		if (this._rejected && !this._value.isRejected()) {
			this._rejected.detach();
		}
		if (!this._value.isFulfilled() && this._pending) {
			attach(this._pending);
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
					setModel(self._fulfilled, self._as, value);
					attach(self._fulfilled);
				}
			},
			function (error:Error):void {
				if (self._rejected) {
					setModel(self._rejected, self._rejectedAs, error);
					attach(self._rejected);
				}
			},
			this._value.isFulfilled() ? null : function (progress:any):void {
				if (self._pending) {
					setModel(self._pending, self._pendingAs, progress);
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

	destroy():void {
		this._fulfilled && this._fulfilled.destroy();
		this._pending && this._pending.destroy();
		this._rejected && this._rejected.destroy();

		this._fulfilled = this._pending = this._rejected = null;

		super.destroy();
	}
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
