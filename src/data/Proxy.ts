import Base from '../Base';
import { hitch } from 'dojo/_base/lang';
import { isObject } from '../util';

class Proxy<T> extends Base {
	/**
	 * Creates a new dstore collection of proxy objects. The new collection will mirror all changes to the original
	 * collection, and vice-versa.
	 */
	static forCollection<T extends Base>(collection: dstore.ISyncCollection<T>): dstore.ISyncCollection<Proxy<T>>;
	static forCollection<T extends Base>(collection: dstore.ICollection<T>): dstore.ICollection<Proxy<T>>;
	static forCollection<T extends Base>(collection: dstore.ISyncCollection<T> | dstore.ICollection<T>): any {
		var Ctor = this;

		var proxies = new WeakMap<T, Proxy<T>>();

		// Proxy-to-model map is tracked here, instead of using `Proxy#get('target')`, so that collections of proxies
		// can be correctly proxied. If we just used `Proxy#get('target')`, we would accidentally grab the wrong object
		// if someone passed the original (non-proxied) object to the proxied collection.
		var models = new WeakMap<Proxy<T>, T>();

		function createProxy(item: T) {
			var proxy: Proxy<T> = proxies.get(item);

			if (!proxy) {
				proxy = new Ctor<T>({ app: item.app, target: item });
				proxies.set(item, proxy);
				models.set(proxy, item);
			}

			return proxy;
		}

		function wrapCollection(collection: dstore.ISyncCollection<T>) {
			var wrapperCollection = Object.create(collection);

			[ 'add', 'addSync', 'put', 'putSync', 'remove', 'removeSync' ].forEach(function (method) {
				if ((<any> collection)[method]) {
					wrapperCollection[method] = function (object: Proxy<T> | T): any {
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
				};
			}

			// TODO: Sort and filter should not need to be wrapped, _createSubCollection should be enough?
			wrapperCollection.sort = function () {
				return wrapCollection(collection.sort.apply(collection, arguments));
			};

			wrapperCollection.filter = function () {
				return wrapCollection(collection.filter.apply(collection, arguments));
			};

			[ 'fetch', 'fetchRange' ].forEach(function (method) {
				if ((<any> collection)[method]) {
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
				}
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

			wrapperCollection._createSubCollection = function (kwArgs: any) {
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

	protected ownProperties: HashMap<boolean>;

	get target(): T {
		return this._target;
	}
	set target(target: T) {
		function bind(target: T, source: Proxy<T>, key: string) {
			Object.defineProperty(source, key, {
				get() {
					return (<any> target)[key];
				},
				set(value: any) {
					(<any> target)[key] = value;
				},
				configurable: true,
				enumerable: true,
				writable: true
			});
			return source.app.binder.observe(target, key, () => {
				source.notify(key);
			});
		}

		var ownProperties = this.ownProperties;
		var oldDescriptors = this._targetDescriptors;
		for (var key in oldDescriptors) {
			if (!(key in target) && !(key in ownProperties)) {
				Object.defineProperty(this, key, {
					value: undefined,
					configurable: true,
					enumerable: false,
					writable: true
				});
			}
		}

		var newDescriptors: HashMap<IHandle> = {};
		for (key in target) {
			if (!(key in ownProperties)) {
				newDescriptors[key] = bind(target, this, key);
				this.notify(key);
			}
		}

		this._target = target;
		this._targetDescriptors = newDescriptors;
	}
	private _target: T;
	private _targetDescriptors: HashMap<IHandle>;

	constructor(kwArgs?: Proxy.KwArgs<T>) {
		var key: string;

		var initialProperties: any = {};
		for (key in kwArgs) {
			if (key !== 'target') {
				initialProperties[key] = (<any> kwArgs)[key];
			}
		}

		super(initialProperties);

		// properties that should never be proxied to the target object
		var ownProperties: HashMap<boolean> = this.ownProperties = {};
		for (key in this) {
			ownProperties[key] = true;
		}

		this.target = kwArgs.target;
	}

	destroy(): void {
		var handles = this._targetDescriptors;

		for (var key in handles) {
			handles[key] && handles[key].remove();
		}

		this._targetDescriptors = this._target = null;
		super.destroy();
	}
}

module Proxy {
	export interface KwArgs<T> extends Base.KwArgs {
		target: T;
	}
}

export default Proxy;
