import core = require('./interfaces');
import has = require('./has');
import lang = require('dojo/_base/lang');
import util = require('./util');

class Observable implements core.IObservable {
	static _initialValues:any;

	static defaults(kwArgs:any):void {
		for (var key in kwArgs) {
			this.prototype['_' + key] = kwArgs[key];
		}
	}

	static set(key:any, value?:any):void {
		// Sets defaults that fire change notifications on construction
		var kwArgs:{ [key:string]: any; };
		if (util.isObject(key)) {
			kwArgs = key;
		}
		else {
			kwArgs = {};
			kwArgs[key] = value;
		}
		this._initialValues = lang.mixin({}, this._initialValues, kwArgs);
	}

	constructor(kwArgs?:{ [key:string]: any; }) {
		if (has('es5')) {
			this._observers = Object.create(null);
		}
		else {
			this._observers = {};
		}
		this._initialize();
		kwArgs && this.set(lang.mixin({}, (<typeof Observable> this.constructor)._initialValues, kwArgs));
	}


	get:core.IObservableGet;
	set:core.IObservableSet;
	// TODO: Do we need this?
	// has:(key:string) => boolean;
	/* protected */ _observers:{ [key:string]: core.IObserver<any>[]; };

	destroy():void {
		this.destroy = function ():void {};
		this._observers = null;
	}

	/* protected */ _initialize():void {
	}

	/* protected */ _notify(newValue:any, oldValue:any, key:string):void {
		var changedMethod = '_' + key + 'Changed';
		this[changedMethod] && this[changedMethod](newValue, oldValue);

		// TODO: we could eventually use the changed handler's return value to suppress observer notifications

		var observers:core.IObserver<any>[] = has('es5') ? this._observers[key] : (this._observers.hasOwnProperty(key) && this._observers[key]);

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
		if (has('es5') ? !this._observers[key] : !this._observers.hasOwnProperty(key)) {
			this._observers[key] = [];
		}

		var observers:core.IObserver<any>[] = this._observers[key];
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
		getter = privateKey + 'Getter';

	if (typeof this[getter] === 'function') {
		return this[getter]();
	}
	return this[privateKey];
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

	if (typeof this[setter] === 'function') {
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

// TODO: Do we need this anymore?
/*Observable.prototype.has = function (key:string):boolean {
	var privateKey = '_' + key;

	return (privateKey in this) || ((privateKey + 'Getter') in this) || ((privateKey + 'Setter') in this);
};*/

export = Observable;
