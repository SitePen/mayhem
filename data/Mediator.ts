/// <reference path="../dojo" />

import aspect = require('dojo/aspect');
import BaseModel = require('./BaseModel');
import core = require('../interfaces');
import data = require('./interfaces');
import declare = require('dojo/_base/declare');
import has = require('dojo/has');
import lang = require('dojo/_base/lang');
import MemoryStore = require('dstore/Memory');
import PropertyProxy = require('./PropertyProxy');
import ObservableStore = require('dstore/Observable');
import util = require('../util');

class Mediator<T extends data.IModel> extends BaseModel implements data.IProxyModel<T> {
	private _modelHandles:{ [key:string]:IHandle };

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_app:core.IApplication;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_model:BaseModel;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_store:any;

	call:Mediator.Callers<T>;
	get:Mediator.Getters<T>;
	set:Mediator.Setters<T>;

	static forCollection(collection:dstore.ICollection<data.IModel>):dstore.ICollection<Mediator<data.IModel>> {
		var Store:any = <any> declare([ MemoryStore, ObservableStore ], {
			model: null
		});
		var wrapperCollection:dstore.ICollection<Mediator<data.IModel>> = new Store().track();
		var Ctor = this;

		collection = collection.track();

		function wrapSetter(method:string):(object:any, options?:Object) => any {
			return function (object:any, options?:Object):any {
				if (object instanceof Mediator) {
					object = object.get('model');
				}

				return collection[method](object, options);
			};
		}

		var put = wrapperCollection.put;
		var remove = wrapperCollection.remove;

		wrapperCollection.add = wrapSetter('add');
		wrapperCollection.put = wrapSetter('put');
		wrapperCollection.remove = lang.hitch(collection, 'remove');

		collection.on('add, update', function (event:dstore.ChangeEvent):void {
			put.call(wrapperCollection, new Ctor({ model: event.target }), { index: event.index });
		});
		collection.on('delete', function (event:dstore.ChangeEvent):void {
			remove.call(wrapperCollection, event.id);
		});

		return wrapperCollection;
	}

	constructor(kwArgs?:{ [key:string]: any; }) {
		this._modelHandles = {};
		super(kwArgs);
	}

	// TODO: Move this functionality to routing
	// _routeStateSetter(routeState:any):void {
	// 	if (!routeState) {
	// 		this.set('model', null);
	// 		return;
	// 	}

	// 	var hasParameters = false,
	// 		modelName:string, idValue:any, match:any[];
	// 	for (var key in routeState) {
	// 		if ((match = key.match(/^(.*)Id$/))) {
	// 			modelName = match[1];
	// 			idValue = routeState[key];
	// 			break;
	// 		}
	// 		hasParameters = true;
	// 	}

	// 	if (hasParameters) {
	// 		this.set('model', this.get('store').get(idValue));
	// 	}
	// }

	getMetadata(key:string):data.IProperty<any> {
		var properties = this._getProperties();
		var property = properties[key];

		if (property) {
			return property;
		}

		var proxy:PropertyProxy<any>;
		var handle:IHandle = this.observe('model', function (newModel:data.IModel):void {
				var newProperty = newModel ? newModel.getMetadata(key) : null;
				proxy.setTarget(newProperty || null);
			});

		var model = this.get('model');
		var modelProperty = model && model.getMetadata(key);

		proxy = new PropertyProxy(modelProperty);
		aspect.after(proxy, 'destroy', function ():void {
			handle.remove();
			proxy = handle = model = modelProperty = null;
		});

		return proxy;
	}

	observe(key:string, observer:core.IObserver<any>):IHandle {
		var handle:IHandle = super.observe(key, observer);
		var privateKey = '_' + key;

		// Keys not pre-defined on the mediator should be delegated to the model, and may change when the model
		// changes
		if (!(privateKey in this) && !((privateKey + 'Setter') in this) && !(key in this._getProperties())) {
			var mediator = this;
			var oldRemove = handle.remove;

			handle.remove = function ():void {
				oldRemove.apply(this, arguments);

				if (!mediator._observers[key].length) {
					mediator._modelHandles[key].remove();
					mediator._modelHandles[key] = null;
				}
			};

			// only set up the model notifier if it hasn't already been set up
			if (!this._modelHandles[key]) {
				var notifier = (newValue:any, oldValue:any):void => {
						this._notify(key, newValue, oldValue);
					},
					model:data.IModel = this.get('model'),
					modelPropertyHandle:IHandle = model && model.observe(key, notifier),
					modelHandle:IHandle = this.observe('model', (newModel:data.IModel, oldModel:data.IModel):void => {
						var oldValue:any = oldModel && oldModel.get(key),
							newValue:any = newModel && newModel.get(key);

						modelPropertyHandle && modelPropertyHandle.remove();
						if (newModel) {
							modelPropertyHandle = newModel.observe(key, notifier);
						}

						if (!util.isEqual(oldValue, newValue)) {
							this._notify(key, newValue, oldValue);
						}
					});

				var oldModelRemove = modelHandle.remove;
				modelHandle.remove = function ():void {
					oldModelRemove.apply(this, arguments);
					modelPropertyHandle && modelPropertyHandle.remove();
				};

				this._modelHandles[key] = modelHandle;
			}
		}

		return handle;
	}
}

Mediator.prototype.call = function (method:string, ...args:any[]):any {
	if (this[method]) {
		return BaseModel.prototype.call.apply(this, arguments);
	}
	else if (this._model) {
		return this._model.call.apply(this._model, arguments);
	}
};

Mediator.prototype.get = function (key:string):any {
	var privateKey = '_' + key;
	var getter = privateKey + 'Getter';
	var value:any;

	if (getter in this) {
		value = this[getter]();
	}
	else {
		var property:data.IProperty<any> = this._getProperties()[key];
		if (property) {
			value = property.get('value');
		}
		else if (privateKey in this) {
			value = this[privateKey];
		}
		else {
			var model = this.get('model');
			if (model) {
				value = model.get(key);
			}
		}
	}

	return value;
};

Mediator.prototype.set = function (key:any, value?:any):void {
	if (util.isObject(key)) {
		BaseModel.prototype.set.call(this, key);
		return;
	}

	var oldValue = this.get(key);
	var privateKey = '_' + key;
	var setter = privateKey + 'Setter';
	var notify = false;

	if (setter in this) {
		notify = true;
		this[setter](value);
	}
	else {
		var property:data.IProperty<any> = this._getProperty(key);
		if (property) {
			property.set('value', value);
		}
		else if (privateKey in this) {
			notify = true;
			this[privateKey] = value;
		}
		else {
			var model = this.get('model');
			if (model) {
				model.set(key, value);
			}
			else if (has('debug')) {
				console.debug('Attempt to set key "%s" on mediator but it has no model and no such key', key);
			}
		}
	}

	if (notify) {
		var newValue = this.get(key);

		if (!util.isEqual(oldValue, newValue)) {
			this._notify(key, newValue, oldValue);
		}
	}
};

// TypeScript does not create default properties on the prototype, but they are necessary to allow these fields to be
// set at runtime and to prevent infinite recursion with the default model getter implementation (using `this.get`
// to allow accessor overrides)

// These properties need to be defined explicitly or they will attempt to fall through to the model;
// in the case of `model` falling through to `model`, it will be an infinite recursion. `app` and `store` always go
// directly to the Mediator since they are per-object properties that should not be propagated directly back to the
// model
Mediator.prototype._app = null;
Mediator.prototype._model = null;
Mediator.prototype._store = null;

module Mediator {
	export interface Callers<T> extends data.IProxyModel.Callers<T> {}
	export interface Getters<T> extends data.IProxyModel.Getters<T> {}
	export interface Setters<T> extends data.IProxyModel.Setters<T> {}
}

export = Mediator;
