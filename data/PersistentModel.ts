/// <reference path="../dstore" />

import Model = require('./Model');
import data = require('./interfaces');
import Promise = require('../Promise');

// TODO: Identical map exists in Model
var NON_DATA_KEYS:HashMap<boolean> = {
	app: true,
	autoSave: true,
	currentScenarioKeys: true,
	dirtyProperties: true,
	errors: true,
	initializing: true,
	isExtensible: true,
	observers: true,
	scenario: true,
	store: true,
	validatorInProgress: true
};

class PersistentModel extends Model implements data.IPersistentModel {
	/**
	 * @get
	 * @set
	 */
	_store:dstore.ICollection<data.IModel>;

	get:PersistentModel.Getters;
	set:PersistentModel.Setters;

	static store:dstore.ICollection<data.IPersistentModel>;
	static setDefaultStore(store:dstore.ICollection<data.IPersistentModel>):void {
		store.Model = this;
		this.prototype._store = this.store = store;
	}

	static findAll(query:any):dstore.ICollection<data.IPersistentModel> {
		return this.store.filter(query);
	}

	static get(id:any):Promise<data.IPersistentModel> {
		return this.store.get(id);
	}

	remove():IPromise<any> {
		var store = this._store;
		var self = this;
		return store.remove(store.getIdentity(this)).then(function <T>(returnValue:T):T {
			self.set('scenario', 'insert');
			return returnValue;
		});
	}

	// TODO: dstore interface?
	_restore(Ctor:new (...args:any[]) => Model):Model {
		return new Ctor(this);
	}

	save(skipValidation?:boolean):IPromise<void> {
		var self = this;

		function save():IPromise<void> {
			return self._store.put(self).then(function (model:PersistentModel):void {
				self.commit();
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

	toJSON():{} {
		var object:HashMap<any> = {};
		// TODO: Fix this when Observable stops using underscored properties
		for (var selfKey in this) {
			if (!Object.prototype.hasOwnProperty.call(this, selfKey) || selfKey.charAt(0) !== '_') {
				continue;
			}

			var key:string = selfKey.slice(1);
			if (key in NON_DATA_KEYS) {
				continue;
			}

			object[key] = (<any> this)[selfKey];
		}

		return object;
	}
}

module PersistentModel {
	export interface Getters extends Model.Getters, data.IPersistentModel.Getters {}
	export interface Setters extends Model.Setters, data.IPersistentModel.Setters {}
}

PersistentModel.prototype._scenario = 'insert';

export = PersistentModel;
