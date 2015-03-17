import binding = require('../binding/interfaces');
import core = require('../interfaces');
import data = require('./interfaces');
import has = require('../has');
import Observable = require('../Observable');
import util = require('../util');
import WeakMap = require('../WeakMap');

class Proxy<T> extends Observable {
	static forCollection<T extends data.IModel>(collection:dstore.ISyncCollection<T>):dstore.ISyncCollection<Proxy<T>>;
	static forCollection<T extends data.IModel>(collection:dstore.ICollection<T>):dstore.ICollection<Proxy<T>>;
	static forCollection<T extends Proxy<data.IModel>>(collection:dstore.ISyncCollection<T>):dstore.ISyncCollection<Proxy<T>>;
	static forCollection<T extends Proxy<data.IModel>>(collection:dstore.ICollection<T>):dstore.ICollection<Proxy<T>>;
	static forCollection<T>(collection:dstore.ISyncCollection<T>|dstore.ICollection<T>):any {
		var Ctor = this;

		var proxies = new WeakMap<T, Proxy<T>>();

		// Proxy-to-model map is tracked here, instead of using `Proxy#get('target')`, so that collections of proxies
		// can be correctly proxied. If we just used `Proxy#get('target')`, we would accidentally grab the wrong object
		// if someone passed the original (non-proxied) object to the proxied collection.
		var models = new WeakMap<Proxy<T>, T>();

		function createProxy(item: T) {
			var proxy:Proxy<T> = proxies.get(item);

			if (!proxy) {
				proxy = new Ctor<T>({ app: (<any> item).get('app'), target: item });
				proxies.set(item, proxy);
				models.set(proxy, item);
			}

			return proxy;
		}

		function wrapCollection(collection:dstore.ISyncCollection<T>) {
			var wrapperCollection = Object.create(collection);

			[ 'add', 'addSync', 'put', 'putSync', 'remove', 'removeSync' ].forEach(function (method) {
				if ((<any> collection)[method]) {
					wrapperCollection[method] = function (object:Proxy<T>|T):any {
						// Either the proxy *or* the original object can be passed to any of the setter methods
						object = models.get(<Proxy<T>> object) || object;

						// TS7017
						return (<any> collection)[method].apply(collection, arguments);
					};
				}
			});

			wrapperCollection.get = function () {
				return collection.get.apply(collection, arguments).then(createProxy);
			};

			if (collection.getSync) {
				wrapperCollection.getSync = function () {
					return createProxy(collection.getSync.apply(collection, arguments));
				}
			}

			// TODO: Sort and filter should not need to be wrapped, _createSubCollection should be enough?
			wrapperCollection.sort = function () {
				return wrapCollection(collection.sort.apply(collection, arguments));
			};

			wrapperCollection.filter = function () {
				return wrapCollection(collection.filter.apply(collection, arguments));
			};

			[ 'fetch', 'fetchRange' ].forEach(function (method) {
				wrapperCollection[method] = function () {
					var promise = (<any> collection)[method].apply(collection, arguments);

					var proxiedPromise = promise.then(function (items: T[]) {
						return items.map(createProxy);
					});
					// TODO: Remove thawing code in 0.4, it is not necessary there
					if (Object.isFrozen(proxiedPromise)) {
						proxiedPromise = Object.create(proxiedPromise);
					}
					if ('totalLength' in promise) {
						proxiedPromise.totalLength = promise.totalLength;
					}
					return proxiedPromise;
				};
			});

			[ 'fetchSync', 'fetchRangeSync' ].forEach(function (method) {
				if ((<any> collection)[method]) {
					wrapperCollection[method] = function () {
						var data = (<any> collection)[method].apply(collection, arguments);
						var proxiedData = data.map(createProxy);
						if ('totalLength' in data) {
							proxiedData.totalLength = data.totalLength;
						}
						return proxiedData;
					};
				}
			});

			if (collection.track) {
				wrapperCollection.track = function () {
					return wrapCollection(collection.track.apply(collection, arguments));
				};
			}

			wrapperCollection._createSubCollection = function (kwArgs:any) {
				// TODO: Model _createSubCollection in d.ts?
				var newCollection = (<any> collection)._createSubCollection(kwArgs);
				return wrapCollection(newCollection);
			};

			wrapperCollection.emit = function (eventName: string, event: dstore.ChangeEvent<Proxy<T>>) {
				var newEvent: dstore.ChangeEvent<T> = Object.create(event);
				// Either the proxy *or* the original object can be emitted from the wrapped collection
				newEvent.target = models.get(event.target) || <any> event.target;
				return collection.emit(eventName, newEvent);
			};

			wrapperCollection.on = function (eventName: string, listener: (event: dstore.ChangeEvent<T>) => void) {
				return collection.on(eventName, function (event) {
					var newEvent: dstore.ChangeEvent<Proxy<T>> = Object.create(event);
					newEvent.target = createProxy(event.target);
					return listener.call(wrapperCollection, newEvent);
				});
			};

			return wrapperCollection;
		}

		return wrapCollection(<dstore.ISyncCollection<T>> collection);
	}

	/**
	 * @protected
	 */
	_app:core.IApplication;

	/**
	 * @protected
	 */
	_target:T;

	// Properties from kwArgs should always go to the Proxy
	private _initializing:boolean;
	private _targetHandles:HashMap<binding.IBinding<any>>;

	get:Proxy.Getters;
	set:Proxy.Setters;

	constructor(kwArgs:HashMap<any>) {
		// TS7017
		var _kwArgs:{ [key:string]:any; app?:core.IApplication; target?:any; } = kwArgs;

		// TODO: Bad idea?
		if (_kwArgs.target && !_kwArgs.app) {
			this._app = _kwArgs.target.get ? _kwArgs.target.get('app') : _kwArgs.target.app;
		}

		this._initializing = true;
		super(_kwArgs);
		this._initializing = false;
	}

	_initialize():void {
		this._targetHandles = has('es5') ? Object.create(null) : {};
	}

	private _createTargetBinding(key:string):void {
		var self = this;
		var binding = this._targetHandles[key] = this._app.get('binder').createBinding(this._target, key, { useScheduler: false });
		binding.observe(function (change:binding.IChangeRecord<any>):void {
			self._notify(key, change.value, change.oldValue);
		});
	}

	destroy():void {
		var handles = this._targetHandles;

		for (var key in handles) {
			handles[key] && handles[key].destroy();
		}

		this._targetHandles = this._target = null;
		super.destroy();
	}

	observe(key:any, observer:core.IObserver<any>):IHandle {
		var privateKey:string = '_' + key;
		var getter:string = privateKey + 'Getter';
		// TS7017
		var hasOwnKey:boolean = (privateKey in this) || typeof (<any> this)[getter] === 'function';

		if (!this._targetHandles[key] && this._target && !hasOwnKey) {
			this._createTargetBinding(key);
		}

		return super.observe(key, observer);
	}

	_targetGetter():T {
		return this._target;
	}
	_targetSetter(target:T):void {
		this._target = target;

		var handles:HashMap<binding.IBinding<any>> = this._targetHandles;
		for (var key in handles) {
			handles[key] && handles[key].destroy();

			if (target) {
				this._createTargetBinding(key);
				// TS7017
				this._notify(key, (<any> target).get ? (<any> target).get(key) : (<any> target)[key], undefined);
			}
		}
	}
}

module Proxy {
	export interface Getters extends Observable.Getters {
		(key:'target'):Observable;
	}
	export interface Setters extends Observable.Setters {
		(key:'target', value:Observable):void;
	}
}

Proxy.prototype.get = function (key:string):any {
	var value:any = Observable.prototype.get.apply(this, arguments);
	var target:any = this._target;
	if (value === undefined && target) {
		value = target.get ? target.get(key) : target[key];

		if (typeof value === 'function') {
			var originalFn:(...args:any[]) => any = value;
			var self = this;
			value = function ():any {
				var thisArg:{} = this === self ? target : this;
				return originalFn.apply(thisArg, arguments);
			};
		}
	}

	return value;
};

Proxy.prototype.set = function (key:any, value?:any):void {
	if (util.isObject(key)) {
		Observable.prototype.set.apply(this, arguments);
		return;
	}

	// TODO: Remove prefix
	var privateKey:string = '_' + key;
	var setter:string = privateKey + 'Setter';

	if (typeof this[setter] === 'function' || (privateKey in this) || this._initializing) {
		Observable.prototype.set.apply(this, arguments);
	}
	else if (this._target) {
		return this._target.set ? this._target.set(key, value) : (this._target[key] = value);
	}
	else {
		return undefined;
	}
};

export = Proxy;
