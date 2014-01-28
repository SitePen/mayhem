import Model = require('../../data/Model');
import Property = require('../../data/Property');
import ValidationError = require('../../validation/ValidationError');

class MyModel extends Model {
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

			fullName: Model.property<string>({
				_valueGetter: function ():string {
					return this.model.get('firstName') + ' ' + this.model.get('lastName');
				},
				_valueSetter: function (value:string):void {
					var names:string[] = value.split(' ');
					this.set({
						firstName: names[0],
						lastName: names.slice(1).join(' ')
					});
				}
			})
		};

		super(kwArgs);
	}

	get(key:'firstName'):string;
	get(key:'lastName'):string;
	get(key:'fullName'):string;
	get(key:string):any;
	get(key:string):any {
		return super.get(key);
	}

	set(key:'firstName', value:string):void;
	set(key:'lastName', value:string):void;
	set(key:'fullName', value:string):void;
	set(kwArgs:{ [key:string]: any; }):void;
	set(key:string, value:any):void;
	set(key:any, value?:any):void {
		return super.set(key, value);
	}
}

export = MyModel;
