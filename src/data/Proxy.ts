import binding = require('../binding/interfaces');
import core = require('../interfaces');
import data = require('./interfaces');
import declare = require('dojo/_base/declare');
import has = require('../has');
import lang = require('dojo/_base/lang');
import MemoryStore = require('dstore/Memory');
import Observable = require('../Observable');
import TrackableStore = require('dstore/Trackable');
import util = require('../util');

class Proxy<T> extends Observable {
	static forCollection(collection:dstore.ICollection<data.IModel>):dstore.ICollection<Proxy<data.IModel>> {
		var Store:typeof MemoryStore = <any> declare([ MemoryStore, TrackableStore ], {
			Model: null
		});
		var wrapperCollection:MemoryStore<Proxy<data.IModel>> = new Store<Proxy<data.IModel>>();
		var Ctor = this;

		collection = collection.track();
		collection.fetch().then(function (initialData:data.IModel[]):void {
			var wrappedData:Proxy<data.IModel>[] = new Array(initialData.length);
			for (var i = 0; i < initialData.length; ++i) {
				wrappedData[i] = new Ctor<data.IModel>({ target: initialData[i] });
			}
			wrapperCollection.setData(wrappedData);
		});
		// TODO: Hack(?) to make indexes show up
		wrapperCollection.fetch();

		function wrapSetter(method:string):(object:any, options?:Object) => any {
			return function (object:any, options?:Object):any {
				// TODO: Better duck typing
				if (object.setTarget) {
					object = object.get('target');
				}

				// TS7017
				return (<any> collection)[method](object, options);
			};
		}

		var put = wrapperCollection.putSync;
		var remove = wrapperCollection.removeSync;

		wrapperCollection.add = wrapSetter('add');
		wrapperCollection.addSync = wrapSetter('addSync');
		wrapperCollection.put = wrapSetter('put');
		wrapperCollection.putSync = wrapSetter('putSync');
		wrapperCollection.remove = lang.hitch(collection, 'remove');
		wrapperCollection.removeSync = lang.hitch(collection, 'removeSync');

		collection.on('add', function (event:dstore.ChangeEvent):void {
			// undefined index means that the add event doesn't match our filtered collection, so should not be put
			// in the wrapper collection either
			if (event.index !== undefined) {
				put.call(wrapperCollection, new Ctor({
					app: event.target.get('app'),
					target: event.target
				}), { index: event.index });
			}
		});
		collection.on('update', function (event:dstore.ChangeEvent):void {
			var id = collection.getIdentity(event.target);

			if (event.index === undefined) {
				remove.call(wrapperCollection, id);
			}
			else if (event.previousIndex === undefined) {
				put.call(wrapperCollection, new Ctor({
					app: event.target.get('app'),
					target: event.target
				}), { index: event.index });
			}
			else {
				put.call(wrapperCollection, wrapperCollection.getSync(id), { index: event.index });
			}
		});
		collection.on('delete', function (event:dstore.ChangeEvent):void {
			remove.call(wrapperCollection, event.id);
		});

		return wrapperCollection;
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
	export interface Getters extends Observable.Getters {}
	export interface Setters extends Observable.Setters {}
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
