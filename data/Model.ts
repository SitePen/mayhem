import array = require('dojo/_base/array');
import BaseModel = require('./BaseModel');
import core = require('../interfaces');
import data = require('./interfaces');
import Deferred = require('dojo/Deferred');
import lang = require('dojo/_base/lang');
import Property = require('./Property');
import util = require('../util');
import when = require('dojo/when');

// TODO: The clarity:
// Model schema is implemented in _schema; this could be implemented another way later, but this is the way we are
// implementing it.
// Each property in the _schema is a property object that contains the metadata for the property
// The value itself is stored on the Model, at property.model[property.key]
// Mediators are just observables, so creating mutable properties for them is very easy

class Model extends BaseModel implements data.IModel {
	_store:dstore.ICollection<data.IModel>;
	_scenario:string;

	private static _store:dstore.ICollection<data.IModel>;
	static store(ctor:{ new (kwArgs?:any):dstore.ICollection<data.IModel>; }, kwArgs?:any):void {
		this.prototype._store = this._store = new ctor(lang.mixin({}, kwArgs, { model: this }));
	}

	static add(model:data.IModel, options:any):IPromise<data.IModel> {
		return when(this._store.add(model, options));
	}

	static get(id:any):IPromise<data.IModel> {
		return when(this._store.get(id));
	}

	static put(model:data.IModel, options:any):IPromise<data.IModel> {
		return when(this._store.put(model, options));
	}

	static remove(id:any):IPromise<data.IModel> {
		return when(this._store.remove(id));
	}

	static filter(query:string):dstore.ICollection<data.IModel>;
	static filter(query:Object):dstore.ICollection<data.IModel>;
	static filter(query:(item:data.IModel, index:number) => boolean):dstore.ICollection<data.IModel>;
	static filter(query:any):dstore.ICollection<data.IModel> {
		return this._store.filter(query);
	}

	static sort(property:string, descending?:boolean):dstore.ICollection<data.IModel>;
	static sort(property:(a:data.IModel, b:data.IModel) => number, descending?:boolean):dstore.ICollection<data.IModel>;
	static sort(property:any, descending?:boolean):dstore.ICollection<data.IModel> {
		return this._store.sort(property, descending);
	}

	static range(start:number, end?:number):dstore.ICollection<data.IModel> {
		return this._store.range(start, end);
	}

	static forEach(callback:(item:data.IModel, index:number) => void, thisObject?:any):IPromise<void> {
		return when(this._store.forEach(callback, thisObject));
	}

	static map<T>(callback:(item:data.IModel, index:number) => T, thisObject?:any):dstore.ICollection<T> {
		return this._store.map(callback, thisObject);
	}

	static fetch():IPromise<data.IModel[]> {
		return when(this._store.fetch());
	}

	constructor(kwArgs:any = {}) {
		if (kwArgs.store) {
			kwArgs = util.omitKeys(kwArgs, ['store']);
		}
		super(kwArgs);
	}

	remove():IPromise<any> {
		return when(this.get('store').remove(this.get('store').getIdentity(this))).then(<T>(returnValue:T):T => {
			this.set('scenario', 'insert');
			return returnValue;
		});
	}

	save(skipValidation?:boolean):IPromise<void> {
		// TODO: Implementation

		return;
	}
}

Model.defaults({
	scenario: 'insert',
	store: null
});

export = Model;
