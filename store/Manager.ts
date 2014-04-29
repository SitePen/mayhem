import Deferred = require('dojo/Deferred');
import lang = require('dojo/_base/lang');
import Observable = require('../Observable');
import store = require('./interfaces');

class StoreManager extends Observable implements store.IManager {
	_defaultStore:string;
	_models:{ [key:string]:any };
	_modelPath:string;
	_storePath:string;

	getStore(storeId:string):IPromise<dstore.ICollection<any>> {
		var record:any = this._models[storeId],
			dfd:IDeferred<dstore.ICollection<any>>;

		if (record && typeof record.then === 'function') {
			return record;
		}

		dfd = new Deferred<dstore.ICollection<any>>();
		this._models[storeId] = dfd.promise;

		if (!record) {
			dfd.reject(new Error('No store configured for ' + storeId));
		}
		else {
			require([
				record.model,
				record.store
			], function (Model:any, ParentStore:any):void {
				var store:dstore.ICollection<any>;

				function Store(kwArgs?:any):void {
					ParentStore.apply(this, arguments);
				}
				Store.prototype = lang.delegate(ParentStore.prototype, {
					model: Model
				});

				store = new (<{ new (kwArgs?:any):dstore.ICollection<any>; (kwArgs?:any):void; }>Store)(record.args);

				dfd.resolve(store);
			});
		}

		return dfd.promise;
	}

	_modelsSetter(modelMap:{ [id:string]:any }):void {
		var models = this._models = {},
			kwArgs:any,
			storeArgs:any,
			store:dstore.ICollection<any>;

		for (var storeId in modelMap) {
			kwArgs = modelMap[storeId];
			var storeRecord:any = models[storeId] = {
				args: {}
			};

			if (typeof kwArgs === 'string') {
				kwArgs = {
					model: kwArgs
				};
			}

			for (var key in kwArgs) {
				var value = kwArgs[key];
				if (key === 'model' || key === 'store') {
					if (typeof value === 'string' && value.charAt(0) === '.') {
						value = require.toAbsMid(this.get(key + 'Path') + '/' + value);
					}
					storeRecord[key] = value;

				}
				else {
					storeRecord.args[key] = value;
				}
			}

			if (!storeRecord.store) {
				storeRecord.store = this.get('defaultStore');
			}
			if (!storeRecord.model) {
				storeRecord.model = this.get('modelPath') + '/' + storeId.charAt(0).toUpperCase() + storeId.slice(1);
			}
		}
	}
}

export = StoreManager;
