import array = require('dojo/_base/array');
import BaseModel = require('./BaseModel');
import core = require('../interfaces');
import data = require('./interfaces');
import Deferred = require('dojo/Deferred');
import Property = require('./Property');
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
	scenario: 'insert'
});

export = Model;
