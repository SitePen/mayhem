import declare = require('dojo/_base/declare');
import MemoryStore = require('dstore/Memory');
import PersistentModel = require('mayhem/data/PersistentModel');
import RequiredValidator = require('mayhem/validation/RequiredValidator');
import Trackable = require('dstore/Trackable');
import Validator = require('mayhem/validation/Validator');

class Todo extends PersistentModel {
	get:Todo.Getters;
	set:Todo.Setters;

	private _name:string;
	private _isCompleted:boolean;

	_initialize():void {
		super._initialize();
		this._name = '';
		this._isCompleted = false;
	}

	_labelsGetter():HashMap<string> {
		return {
			name: 'Name',
			isCompleted: 'Completed?'
		};
	}

	_scenariosGetter():HashMap<string[]> {
		var fields = [ 'name', 'isCompleted' ];
		return {
			insert: fields,
			update: fields
		};
	}

	_validatorsGetter():HashMap<Validator[]> {
		return {
			name: [ new RequiredValidator() ]
		};
	}
}

module Todo {
	export interface Getters extends PersistentModel.Getters {
		(key:'name'):string;
		(key:'isCompleted'):boolean;
	}

	export interface Setters extends PersistentModel.Setters {
		(key:'name', value:string):void;
		(key:'isCompleted', value:boolean):void;
	}
}

Todo.setDefaultStore(<any> new (<any> declare([ MemoryStore, Trackable ]))());
Todo.setDefaultApp('app/main');

export = Todo;
