import declare = require('dojo/_base/declare');
import PersistentModel = require('mayhem/data/PersistentModel');
import Store = require('<%= store %>');
import Trackable = require('dstore/Trackable');
import Validator = require('mayhem/validation/Validator');

class <%= modelName %> extends PersistentModel {
	get:<%= modelName %>.Getters;
	set:<%= modelName %>.Setters;

	protected _labelsGetter():HashMap<string> {
		return {
		};
	}

	protected _scenariosGetter():HashMap<string[]> {
		var fields:string[] = [];
		return {
			insert: fields,
			update: fields
		};
	}

	protected _validatorsGetter():HashMap<Validator[]> {
		return {
		};
	}
}

module <%= modelName %> {
	export interface Getters extends PersistentModel.Getters {
	}
	export interface Setters extends PersistentModel.Setters {
	}
}

var store = <any> new (<any> declare([ Store, Trackable ]))();
<%= modelName %>.setDefaultApp('app/main');
<%= modelName %>.setDefaultStore(store);

export = <%= modelName %>;
