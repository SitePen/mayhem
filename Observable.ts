import core = require('./interfaces');
import util = require('./util');

class Observable implements core.IObservable {
	get:core.IObservableGet;
	/* protected */ _observers:{ [key:string]: core.IObserver<any>[]; } = {};
	set:core.IObservableSet;

	constructor(kwArgs?:{ [key:string]: any; }) {
		kwArgs && this.set(kwArgs);
	}

	destroy():void {
		this.destroy = function ():void {};
		this._observers = null;
	}

	/* protected */ _notify(newValue:any, oldValue:any, key:string):void {
		var observers:core.IObserver<any>[] = this._observers['*' + key];

		if (observers) {
			// Prevent mutation of the observers list from affecting this loop
			observers = observers.slice(0);

			// TODO: Should watcher notifications be scheduled? It might be a good idea, or it might cause
			// data-binding to inefficiently take two cycles through the event loop.
			var observer:core.IObserver<any>;
			for (var i = 0; (observer = observers[i]); ++i) {
				observer.call(this, newValue, oldValue, key);
			}
		}
	}

	observe(key:any, observer:core.IObserver<any>):IHandle {
		// Prefix all keys as a simple way to avoid collisions if someone uses a name for a watch that is also on
		// `Object.prototype`
		// TODO: In ES5 we can just use `Object.create(null)` instead

		if (!this._observers['*' + key]) {
			this._observers['*' + key] = [];
		}

		var observers:core.IObserver<any>[] = this._observers['*' + key];
		observers.push(observer);

		return {
			remove: function ():void {
				this.remove = function ():void {};
				util.spliceMatch(observers, observer);
				observers = observer = null;
			}
		};
	}
}

Observable.prototype.get = function (key:string):any {
	var privateKey = '_' + key,
		getter = privateKey + 'Getter',
		value:any;

	if (getter in this) {
		value = this[getter]();
	}
	else {
		value = this[privateKey];
	}

	return value;
};
Observable.prototype.set = function (key:any, value?:any):void {
	if (util.isObject(key)) {
		var kwArgs:{ [key:string]: any; } = key;
		for (key in kwArgs) {
			this.set(key, kwArgs[key]);
		}

		return;
	}

	var oldValue = this.get(key),
		privateKey = '_' + key,
		setter = privateKey + 'Setter';

	if (setter in this) {
		this[setter](value);
	}
	else {
		this[privateKey] = value;
	}

	var newValue = this.get(key);

	if (!util.isEqual(oldValue, newValue)) {
		this._notify(newValue, oldValue, key);
	}
};

export = Observable;
