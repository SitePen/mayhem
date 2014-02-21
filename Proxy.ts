import core = require('./interfaces');
import Observable = require('./Observable');

class Proxy extends Observable implements core.IProxy {
	private _target:core.IObservable;
	private _targetHandles:{ [key:string]: IHandle } = {};

	constructor(observable:core.IObservable) {
		super();

		this._target = observable;
	}

	destroy():void {
		super.destroy();

		this.setTarget(null);
	}

	get(key:string):any {
		return this._target ? this._target.get(key) : undefined;
	}

	observe(key:any, observer:core.IObserver<any>):IHandle {
		var observers:core.IObserver<any>[] = this._observers['*' + key];

		var handleKey = '*' + key;
		if (!this._targetHandles['*' + key]) {
			if (this._target != null) {
				this._targetHandles['*' + key] = this._target.observe(key, (newValue:any, oldValue:any, key?:string):void => {
					this._notify(newValue, oldValue, key);
				});
			}
			else {
				this._targetHandles['*' + key] = undefined;
			}
		}

		return super.observe(key, observer);
	}

	set(key:any, value?:any):void {
		if (this._target) {
			this._target.set(key, value);
		}
	}

	setTarget(observable:core.IObservable):void {
		var handles = this._targetHandles;

		this._target = observable;
		this._targetHandles = {};

		for (var key in handles) {
			if (!handles.hasOwnProperty(key)) {
				continue;
			}
			handles[key].remove();

			if (observable != null) {
				handles[key] = observable.observe(key, (newValue:any, oldValue:any, key?:string):void => {
					this._notify(newValue, oldValue, key);
				});
				this._notify(observable.get(key), undefined, key);
			}
		}
	}
}

export = Proxy;
