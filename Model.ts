import core = require('./interfaces');
import has = require('./has');
import Mediator = require('./Mediator');
import ModelProxty = require('./ModelProxty');
import ValidationError = require('./validators/ValidationError');

class User extends Model {
	username:core.IModelProxty<string> = new ModelProxty<string>({
		label: 'Username',
		validators: [ {
			validate: function (model:core.IModel, key:string, proxty:ModelProxty<string>):void {
				model.addError(key, new ValidationError('You broke it!', { name: proxty.label }));
			}
		} ]
	});

	firstName:core.IModelProxty<string> = new ModelProxty<string>({
		default: 'Joe',
		validators: []
	});

	lastName:core.IModelProxty<string> = new ModelProxty<string>({
		default: 'Bloggs',
		validators: []
	});
}

class UserMediator extends Mediator {
	fullName:core.IModelProxty<string> = new ModelProxty<string>({
		get: function () {
			return this.get('firstName') + ' ' + this.get('lastName');
		},
		dependencies: [ 'firstName', 'lastName' ]
	});
}

class Model /* implements core.IModel */ {
	collection:any /*dstore.Collection*/;
	isExtensible:boolean = true;
	scenario:string = 'insert';

	get(key:string):any {
		return this[key] && this[key].get();
	}

	set(key:string, value:any):void {
		if (!(key in this)) {
			if (this.isExtensible) {
				this[key] = new ModelProxty<typeof value>({});
			}
			else if (has('debug')) {
				console.warn('Not setting undefined property "' + key + '" on model');
				return;
			}
		}

		this[key].set(value);
	}

	validate()/*:IPromise<boolean>*/ {

	}
}

export = Model;
