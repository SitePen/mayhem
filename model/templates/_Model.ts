import Model = require('mayhem/data/Model');
import Validator = require('mayhem/validation/Validator');

class <%= modelName %> extends Model {
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
	export interface Getters extends Model.Getters {
	}
	export interface Setters extends Model.Setters {
	}
}

export = <%= modelName %>;
