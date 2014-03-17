import data = require('../../data/interfaces');
import MemoryStore = require('dojo/store/Memory');
import Model = require('../../data/Model');
import ObservableArray = require('../../ObservableArray');
import ObservableStore = require('dojo/store/Observable');
import Property = require('../../data/Property');
import ValidationError = require('../../validation/ValidationError');

class MyModel extends Model {
	get:MyModel.IGet;
	set:MyModel.ISet;
}

module MyModel {
	export interface IGet extends data.IModelGet {
		(key:'firstName'):string;
		(key:'lastName'):string;
		(key:'fullName'):string;
	}
	export interface ISet extends data.IModelSet {
		(key:'firstName', value:string):void;
		(key:'lastName', value:string):void;
		(key:'fullName', value:string):void;
	}
}

MyModel.schema(():any => {
	return {
		firstName: Model.property<string>({
			label: 'First name',
			validators: [ {
				validate: function (model:MyModel, key:string, value:string):void {
					if (value !== 'Joe') {
						model.addError(key, new ValidationError('You must be Joe!'));
					}
				}
			} ],
			value: 'Joe'
		}),

		lastName: Model.property<string>({
			label: 'Last name',
			value: 'Bloggs'
		}),

		hobbies: Model.property<ObservableArray<string>>({
			label: 'Hobbies',
			value: new ObservableArray<string>([ 'drinking', 'sportsball', 'drinking' ])
		}),

		enabled: Model.property<boolean>({
			label: 'Enabled',
			value: true
		}),

		// phone: Model.property<IStore<IPhoneRecord>>({
		phone_numbers: Model.property<ObservableStore<any>>({
			label: 'Phone Numbers',
			value: null
		}),

		fullName: Model.property<string>({
			valueGetter: function ():string {
				return this.get('model').get('firstName') + ' ' + this.get('model').get('lastName');
			},
			valueSetter: function (value:string):void {
				var names:string[] = value.split(' ');
				this.get('model').set({
					firstName: names[0],
					lastName: names.slice(1).join(' ')
				});
			},
			dependencies: [ 'firstName', 'lastName' ]
		}),

		firstNameIsJoey: Model.property<boolean>({
			valueGetter: function ():boolean {
				return this.get('model').get('firstName') === 'Joey';
			},
			dependencies: [ 'firstName' ]
		})
	};
});

export = MyModel;
