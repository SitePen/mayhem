import core = require('./interfaces');
import util = require('./util');

class Observable implements core.IObservable {
	private _observers:{ [key:string]: core.IObserver<any>[]; } = {};

	constructor(kwArgs?:{ [key:string]: any; }) {
		kwArgs && this.set(kwArgs);
	}

	get(key:string):any {
		var getter = '_' + key + 'Getter',
			value:any;

		if (getter in this) {
			value = this[getter]();
		}
		else {
			value = this[key];
		}

		return value;
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

	set(kwArgs:{ [key:string]: any; }):void;
	set(key:string, value:any):void;
	set(key:any, value?:any):void {
		if (util.isObject(key)) {
			var kwArgs:{ [key:string]: any; } = key;
			for (key in kwArgs) {
				this.set(key, kwArgs[key]);
			}

			return;
		}

		var oldValue = this.get(key),
			setter = '_' + key + 'Setter';

		if (setter in this) {
			this[setter](value);
		}
		else {
			this[key] = value;
		}

		var newValue = this.get(key);

		if (!util.isEqual(oldValue, newValue)) {
			this._notify(newValue, oldValue, key);
		}
	}
}

export = Observable;
