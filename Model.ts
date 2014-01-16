import core = require('./interfaces');
import ModelProxty = require('./ModelProxty');

class User extends Model {
/*	metadata = {
		firstName: {
			default: 'Joe',
			label: 'First name',
			validators: [],
			errors: []
		},

		fullName: {
			label: 'Full name',
			get: function () {
				return this.firstName + ' ' + this.lastName;
			}
		}
	};*/

	username:core.IModelProxty<string> = new ModelProxty<string>({
		validators: []
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

class Model {
	collection:any /*dstore.Collection*/;
	isExtensible:boolean = true;

	static property<T>(kwArgs:{
		default?:T;
		validators?:core.IValidator[];
		get?:() => T;
		set?:(value:T) => void;
	}):IModelProxty<T> {
		return new ModelProxty
	}

	get(key:string):any {
		return this[key] && this[key].get();
	}

	set(key:string, value:any):void {
		if (!(key in this) && this.dynamic) {
			this[key] = Model.property();
		}

		this[key].set(value);
	}
}

export = Model;
