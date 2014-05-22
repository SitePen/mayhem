import array = require('dojo/_base/array');
import lang = require('dojo/_base/lang');
import Mediator = require('./Mediator');
import when = require('dojo/when');

class StoreMediator<T> extends Mediator {
	private _store:dstore.ICollection<any>;
	private _itemMediatorCtor:new (kwArgs?:any) => T;

	_createSubCollection(kwArgs:any):StoreMediator<T> {
		var newCollection = lang.delegate(this.constructor.prototype);

		for (var i in this) {
			if (i.charAt(0) === '_' && this.hasOwnProperty(i)) {
				newCollection[i] = this[i];
			}
		}

		return lang.mixin(newCollection, kwArgs);
	}

	_routeStateSetter(routeState:any):void {
		console.log('StoreMediator route state', routeState);
	}

	getIdentity(item:any):any {
		return this._store.getIdentity(item);
	}

	filter(query:any):StoreMediator<T> {
		return this._createSubCollection({
			_store: this._store.filter(query),
			_itemMediatorCtor: this._itemMediatorCtor
		});
	}

	sort(property:any, descending?:boolean):StoreMediator<T> {
		return this._createSubCollection({
			_store: this._store.sort(property, descending),
			_itemMediatorCtor: this._itemMediatorCtor
		});
	}

	range(start:number, end?:number):StoreMediator<T> {
		return this._createSubCollection({
			_store: this._store.range(start, end),
			_itemMediatorCtor: this._itemMediatorCtor
		});
	}

	forEach(callback:(item:any, index:number) => void, thisObject?:any):any {
		return this._createSubCollection({
			_store: this._store.forEach(callback, thisObject),
			_itemMediatorCtor: this._itemMediatorCtor
		});
	}

	map(callback:(item:any, index:number) => any, thisObject?:any):StoreMediator<T> {
		return this._createSubCollection({
			_store: this._store.map(callback, thisObject),
			_itemMediatorCtor: this._itemMediatorCtor
		});
	}

	fetch():IPromise<T[]> {
		return when(this._store.fetch()).then((items:any[]):T[] => {
			// TODO: wrap in item view models
			return array.map(items, (item:any):any => new this._itemMediatorCtor({ model: item }));
		});
	}

	query(query:any, options:any):IPromise<T[]> {
		return when((<any>this._store).query(query, options)).then((items:any[]):T[] => {
			return array.map(items, (item:any):any => new this._itemMediatorCtor({ model: item }));
		});
	}
}

StoreMediator.defaults({
	store: null
});

export = StoreMediator;
