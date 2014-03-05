import MemoryStore = require('dojo/store/Memory');
import Model = require('../../data/Model');
import ObservableArray = require('../../ObservableArray');
import ObservableStore = require('dojo/store/Observable');
import Property = require('../../data/Property');
import ValidationError = require('../../validation/ValidationError');

class MyModel extends Model {
	// TODO: TS#2153
	// get(key:'firstName'):string;
	// get(key:'lastName'):string;
	// get(key:'fullName'):string;
	// set(key:'firstName', value:string):void;
	// set(key:'lastName', value:string):void;
	// set(key:'fullName', value:string):void;

	constructor(kwArgs?:{ [key:string]: any; }) {
		this._schema = {
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

			//phone: Model.property<IStore<IPhoneRecord>>({
			phone_numbers: Model.property<ObservableStore<any>>({
				label: 'Phone Numbers',
				value: new ObservableStore(new MemoryStore({ data: [
					{
						id: 'primary',
						type: 'mobile',
						value: '555-555-5555'
					},
					{
						id: 'secondary',
						type: 'mobile',
						value: '555-555-1234'
					}
				]}))
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

		super(kwArgs);
	}
}

export = MyModel;
