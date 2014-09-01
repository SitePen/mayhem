/// <reference path="../dstore" />

import BaseModel = require('./BaseModel');
import data = require('./interfaces');

// TODO: The clarity:
// Model schema is implemented in _schema; this could be implemented another way later, but this is the way we are
// implementing it.
// Each property in the _schema is a property object that contains the metadata for the property
// The value itself is stored on the Model, at property.model[property.key]
// Mediators are just observables, so creating mutable properties for them is very easy

class PersistentModel extends BaseModel implements data.IPersistentModel {
	/**
	 * @get
	 * @set
	 */
	_scenario:string;

	/**
	 * @get
	 * @set
	 */
	_store:dstore.ICollection<data.IModel>;

	call:PersistentModel.Callers;
	get:PersistentModel.Getters;
	set:PersistentModel.Setters;

	static store:dstore.ICollection<data.IModel>;
	static setDefaultStore(store:dstore.ICollection<data.IModel>):void {
		store.model = this;
		this.prototype._store = this.store = store;
	}

	remove():IPromise<any> {
		var store = this._store;
		var self = this;
		return store.remove(store.getIdentity(this)).then(function <T>(returnValue:T):T {
			self.set('scenario', 'insert');
			return returnValue;
		});
	}

	save(skipValidation?:boolean):IPromise<void> {
		var self = this;

		function save():IPromise<void> {
			return self._store.put(self).then(function ():void {
				self.set('scenario', 'update');
			});
		}

		if (skipValidation) {
			return save();
		}
		else {
			return this.validate().then(function (isValid:boolean):IPromise<void> {
				if (isValid) {
					return save();
				}
				else {
					throw new Error('Could not save model; validation failed');
				}
			});
		}
	}
}

module PersistentModel {
	export interface Callers extends BaseModel.Callers, data.IModel.Callers {}
	export interface Getters extends BaseModel.Getters, data.IModel.Getters {}
	export interface Setters extends BaseModel.Setters, data.IModel.Setters {}
}

PersistentModel.prototype._scenario = 'insert';

export = PersistentModel;
