import dojoDeclare = require('dojo/_base/declare');
import DomStorage = require('mayhem/data/stores/DomStorage');
import PersistentModel = require('mayhem/data/PersistentModel');
import Trackable = require('dstore/Trackable');
import ValidationError = require('mayhem/validation/ValidationError');

class UserRegistration extends PersistentModel {
	get:UserRegistration.Getters;
	set:UserRegistration.Setters;

	constructor(kwargs?:any) {
		super(kwargs);

		var self = this;
		this.observe('dateOfBirth', function (dob:Date) {
			var age:number;

			if (dob) {
				var today:Date = new Date();
				var age = today.getFullYear() - dob.getFullYear();
				var monthDif = today.getMonth() - dob.getMonth();
				if (monthDif < 0 || (monthDif === 0 && dob.getDate() > today.getDate())) {
					age--;
				}
			}

			self.set('age', age);
		});
	}

	reset():void {
		this.set({
			allowedToContact: false,
			dateOfBirth: null,
			email: null,
			errors: {},
			favoriteBrowser: null,
			name: null,
			notes: null,
			password: null,
			passwordVerification: null,
			typeOfDeveloper: null,
			username: null
		});
	}
}

module UserRegistration {
	export interface Getters extends PersistentModel.Getters {
		(key:'age'):number;
		(key:'allowedToContact'):boolean;
		(key:'dateOfBirth'):Date;
		(key:'email'):string
		(key:'errors'):HashMap<ValidationError[]>;
		(key:'favoriteBrowser'):string;
		(key:'name'):string;
		(key:'notes'):string;
		(key:'password'):string;
		(key:'passwordVerification'):string;
		(key:'typeOfDeveloper'):string;
		(key:'username'):string;
	}

	export interface Setters extends PersistentModel.Setters {
		(key:'age', value:number):void;
		(key:'allowedToContact', value:boolean):void;
		(key:'dateOfBirth', value:Date):void;
		(key:'email', value:string):void
		(key:'errors', value:HashMap<ValidationError[]>):void;
		(key:'favoriteBrowser', value:string):void;
		(key:'name', value:string):void;
		(key:'notes', value:string):void;
		(key:'password', value:string):void;
		(key:'passwordVerification', value:string):void;
		(key:'typeOfDeveloper', value:string):void;
		(key:'username', value:string):void;
	}
}

UserRegistration.setDefaultStore(<any> new (<any> dojoDeclare([DomStorage, Trackable]))({key: 'mayhem-prototype2'}));

export = UserRegistration;