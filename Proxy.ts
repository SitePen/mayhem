import core = require('./interfaces');
import has = require('./has');
import Observable = require('./Observable');

class Proxy extends Observable {
	/**
	 * @protected
	 */
	_target:core.IObservable;
	private _targetHandles:HashMap<IHandle>;

	get:Proxy.Getters;
	set:Proxy.Setters;

	// TODO: Does not match normal kwArgs API; is this really OK?
	constructor(target:core.IObservable) {
		super();
		this._target = target;
	}

	_initialize():void {
		this._targetHandles = has('es5') ? Object.create(null) : {};
	}

	destroy():void {
		this.setTarget(null);
		super.destroy();
	}

	observe(key:any, observer:core.IObserver<any>):IHandle {
		if (!this._targetHandles[key]) {
			if (this._target != null) {
				var self = this;
				this._targetHandles[key] = this._target.observe(key, function (newValue:any, oldValue:any, key?:string):void {
					self._notify(key, newValue, oldValue);
				});
			}
			else {
				this._targetHandles[key] = undefined;
			}
		}

		return super.observe(key, observer);
	}

	setTarget(target:core.IObservable):void {
		var handles = this._targetHandles;

		this._target = target;
		this._targetHandles = has('es5') ? Object.create(null) : {};

		for (var key in handles) {
			if (has('es5') ? !(key in handles) : !handles.hasOwnProperty(key)) {
				continue;
			}
			handles[key] && handles[key].remove();

			if (target != null) {
				handles[key] = target.observe(key, (newValue:any, oldValue:any, key?:string):void => {
					this._notify(key, newValue, oldValue);
				});
				this._notify(key, target.get(key), undefined);
			}
		}
	}
}

Proxy.prototype.get = function (key:string):any {
	return this._target ? this._target.get(key) : undefined;
};

Proxy.prototype.set = function (key:any, value?:any):void {
	if (this._target) {
		this._target.set(key, value);
	}
};

module Proxy {
	export interface Getters extends Observable.Getters {}
	export interface Setters extends Observable.Setters {}
}

export = Proxy;
