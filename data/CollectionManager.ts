/// <reference path="../dstore.d.ts"/>

import all = require('dojo/promise/all');
import core = require('../interfaces');
import data = require('./interfaces');
import Deferred = require('dojo/Deferred');
import lang = require('dojo/_base/lang');
import Observable = require('../Observable');
import Store = require('dstore/Store');
import Adapter = require('dstore/legacy/DstoreAdapter');

function resolve(value:string):string {
	return value.replace(/(^|\/)([a-z])([^\/]*)$/, ():string => {
		return arguments[1] + arguments[2].toUpperCase() + arguments[3];
	});
}

class CollectionManager extends Observable {
	_values:CollectionManager.IValues;
	get:CollectionManager.IGet;

	getCollection(name:string):IPromise<dstore.ICollection<data.IModel>> {
		var models = this.get('models'),
			collection:any = models[name];

		if (collection && typeof collection.then === 'function') {
			return collection;
		}

		var dfd = new Deferred<dstore.ICollection<data.IModel>>();

		models[name] = dfd.promise;

		if (!collection) {
			dfd.resolve(null);
		}
		else {
			require([
				collection.model,
				collection.store
			], function (Model:Function, Store:{ new (kwArgs:any):dstore.ICollection<data.IModel>; }):void {
				try {
					var store = new Store(lang.mixin({}, collection.storeArgs, {
						model: Model
					}));
					Adapter.adapt(store);
					store.getIdentity = function (item:any):any {
						return item.get(this.idProperty);
					};
					dfd.resolve(store);
				}
				catch (e) {
					dfd.reject(e);
				}
			});
		}

		return dfd.promise;
	}

	_modelsSetter(modelMap:{ [id:string]: any }):void {
		var models:any = this._values.models = {};

		var kwArgs:any,
			collection:dstore.ICollection<any>;

		for (var modelId in modelMap) {
			kwArgs = modelMap[modelId];

			if (typeof kwArgs === 'string') {
				kwArgs = { model: kwArgs };
			}

			var resolvedModelId = resolve(kwArgs.model);

			for (var key in { model: 1, store: 1, target: 1 }) {
				var value = kwArgs[key];

				if (value == null && key === 'store') {
					kwArgs[key] = this.get('defaultStore');
				}
				else if (key === 'model') {
					if (value == null) {
						value = resolvedModelId;
					}
					else {
						value = resolve(value);
					}

					kwArgs[key] = this.get(key + 'Path').replace(/\/*$/, '/') + value;
				}
				else if (key === 'target') {
					kwArgs.storeArgs = { target: value };
				}
			}

			models[modelId] = kwArgs;
		}
	}
}

module CollectionManager {
	export interface IGet extends core.IObservableGet {
		(key:'defaultStore'):string;
		(key:'models'):{ [key:string]:any };
	}
	export interface IValues {
		models:{ [key:string]:any; };
	}
}

export = CollectionManager;
