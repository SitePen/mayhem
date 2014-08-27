import core = require('./interfaces');
import has = require('./has');
import Observable = require('./Observable');

class Proxy extends Observable implements core.IProxy {
	private _target:core.IObservable;
	private _targetHandles:{ [key:string]: IHandle };

	constructor(observable:core.IObservable) {
		super();

		this._target = observable;
	}

	_initialize():void {
		if (has('es5')) {
			this._targetHandles = Object.create(null);
		}
		else {
			this._targetHandles = {};
		}
	}

	destroy():void {
		super.destroy();

		this.setTarget(null);
	}

	observe(key:any, observer:core.IObserver<any>):IHandle {
		var observers:core.IObserver<any>[] = this._observers[key];

		var handleKey = key;
		if (!this._targetHandles[key]) {
			if (this._target != null) {
				this._targetHandles[key] = this._target.observe(key, (newValue:any, oldValue:any, key?:string):void => {
					this._notify(key, newValue, oldValue);
				});
			}
			else {
				this._targetHandles[key] = undefined;
			}
		}

		return super.observe(key, observer);
	}

	setTarget(observable:core.IObservable):void {
		var handles = this._targetHandles;

		this._target = observable;
		if (has('es5')) {
			this._targetHandles = Object.create(null);
		}
		else {
			this._targetHandles = {};
		}

		for (var key in handles) {
			if (has('es5') ? !(key in handles) : !handles.hasOwnProperty(key)) {
				continue;
			}
			handles[key] && handles[key].remove();

			if (observable != null) {
				handles[key] = observable.observe(key, (newValue:any, oldValue:any, key?:string):void => {
					this._notify(key, newValue, oldValue);
				});
				this._notify(key, observable.get(key), undefined);
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

export = Proxy;
