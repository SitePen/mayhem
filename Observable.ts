import core = require('./interfaces');
import has = require('./has');
import lang = require('dojo/_base/lang');
import util = require('./util');

/**
 * The Observable class is a base object class that provides the ability to use computed properties and observe
 * properties for changes in EcmaScript 3 browsers.
 *
 * When interacting with an Observable object, the `get` and `set` methods are used to get and set properties of the
 * object, rather than the normal dot and assignment operators.
 */
class Observable implements core.IObservable {
	/**
	 * Gets the value of a property on the object.
	 *
	 * @method
	 * @param {string} key The key to retrieve.
	 * @returns {any} The value of the property.
	 */
	get:Observable.Getters;

	// TODO: Why is this not private?
	/**
	 * Not private in order to facilitate extension by Proxty and Proxy.
	 *
	 * @protected
	 */
	_observers:HashMap<core.IObserver<any>[]>;

	/**
	 * Sets multiple properties on the object at once.
	 *
	 * @method
	 * @property set
	 * @param {HashMap<any>} kwArgs A list of properties to set.
	 */

	/**
	 * Sets a value of a property on the object.
	 *
	 * @method
	 * @param {string} key The key to set.
	 * @param {any} value The value to set.
	 */
	set:Observable.Setters;

	/**
	 * @constructor module:mayhem/Observable
	 * @param {HashMap<any>=} kwArgs An initial set of properties to set on the object at construction time.
	 */
	constructor(kwArgs:HashMap<any> = {}) {
		this._observers = has('es5') ? Object.create(null) : {};
		this._initialize();
		this.set(kwArgs);
	}

	/**
	 * Destroys the object. Subclasses may perform additional cleanup upon destruction, so make sure to call `destroy`
	 * whenever you are finished working with any Observable object.
	 */
	destroy():void {
		this.destroy = function ():void {};
		this._observers = null;
	}

	/**
	 * Provides a mechanism for subclasses to set default properties. These default properties will then be overridden
	 * by any values passed to the class using the `kwArgs` object.
	 *
	 * @protected
	 */
	_initialize():void {}

	/**
	 * Notifies observers of the given property that its value has changed.
	 *
	 * @protected
	 * @param {string} key The name of the property.
	 * @param {any} newValue The new value for the property.
	 * @param {any} oldValue The old value for the property.
	 */
	_notify(key:string, newValue:any, oldValue:any):void {
		var observers:core.IObserver<any>[] = has('es5') ?
			this._observers[key] :
			(this._observers.hasOwnProperty(key) && this._observers[key]);

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

	/**
	 * Observes a property on the object for changes.
	 *
	 * @param key The name of the property to observe.
	 * @param observer An callback that will be invoked whenever the property changes.
	 * @returns A handle that can be used to stop observing the property.
	 */
	observe(key:string, observer:core.IObserver<any>):IHandle {
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

module Observable {
	export interface Getters extends core.IObservable.Getters {}
	export interface Setters extends core.IObservable.Setters {}
}

Observable.prototype.get = function (key:string):any {
	var privateKey:string = '_' + key;
	var getter:string = privateKey + 'Getter';

	if (typeof this[getter] === 'function') {
		return this[getter]();
	}

	return this[privateKey];
};

Observable.prototype.set = function (key:any, value?:any):void {
	if (util.isObject(key)) {
		var kwArgs:HashMap<any> = key;
		for (key in kwArgs) {
			// If a typed object is passed in as the kwArgs object, we do not want to copy its constructor onto this
			// instance, since this will result in this object having an incorrect reference back to its own constructor
			if (key === 'constructor') {
				continue;
			}
			this.set(key, kwArgs[key]);
		}

		return;
	}

	var oldValue:any = this.get(key);
	var privateKey:string = '_' + key;
	var setter:string = privateKey + 'Setter';

	if (typeof this[setter] === 'function') {
		this[setter](value);
	}
	else {
		this[privateKey] = value;
	}

	var newValue = this.get(key);
	if (!util.isEqual(oldValue, newValue)) {
		this._notify(key, newValue, oldValue);
	}
};

export = Observable;
