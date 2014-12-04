import data = require('mayhem/data/interfaces');
import lang = require('dojo/_base/lang');
import Proxy = require('mayhem/data/Proxy');
import UserRegistration = require('../models/UserRegistration');
import ValidationError = require('mayhem/validation/ValidationError');
import Validator = require('mayhem/validation/Validator');
import WebApplication = require('mayhem/WebApplication');
import locale = require('dojo/date/locale');

class Registration extends Proxy<UserRegistration> {
	get:Registration.Getters;
	set:Registration.Setters;

	private _validators:HashMap<Validator[]>;

	constructor(kwargs?:any) {
		super(kwargs);

		this.set('target', new UserRegistration({
			validators: {
				name: [
					new RequiredValidator({
						messages: {
							missing: 'Please give us a name.'
						}
					})
				],
				email: [
					new EmailValidator({
						messages: {
							missing: 'Please oh please enter an email address.',
							invalid: 'Please enter something that looks like an email address.'
						}
					})
				]
			}
		}));
	}

	_formattedDateOfBirthGetter():string {
		var dob:Date = this.get('target').get('dateOfBirth');
		if (dob) {
			return locale.format(dob, {selector: 'date', datePattern: 'MMMM d, yyyy'});
		}
	}

	cancel():void {
		this.get('target').reset();
		this.get('app').get('router').go('index');
	}

	review():void {
		var self = this;
		console.log("Model before save: ", this.get('target'));
		this.get('target').save().then(function () {
			self.get('app').get('router').go('registration', {review: true});
		}).otherwise(function () {
			// Stay on screen.  This function stops errors from appearing in the console.
		});
	}

	complete():void {
		// TBD: reset the model
		this.get('target').reset();
		this.get('app').get('router').go('thanks');
	}
}

module Registration {
	export interface Getters extends Proxy.Getters {
		(key:'target'):UserRegistration;
		(key:'app'):WebApplication;
		(key:'formattedDateOfBirth'):String;
	}
	export interface Setters extends Proxy.Setters {
		(key:'target', value:UserRegistration):void;
		(key:'app', value:WebApplication):void;
	}
}

interface IMyValidatorOptions extends Validator.IOptions {
	messages:HashMap<string>;
}

class MyValidator extends Validator {
	options:IMyValidatorOptions;
}

class RequiredValidator extends MyValidator {

	validate(model:data.IModel, key:string, value:any):void {
		value = value && lang.trim(value);
		if (!value) {
			model.addError(key, new ValidationError(this.options.messages['missing']));
		}
	}
}

class EmailValidator extends RequiredValidator {

	validate(model:data.IModel, key:string, value:any):void {
		var email:string;

		if (model.get('allowedToContact')) {
			super.validate(model, key, value);
			if (model.get('isValid')) {
				if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
					model.addError(key, new ValidationError(this.options.messages['invalid']));
				}
			}
		}
	}
}

export = Registration;