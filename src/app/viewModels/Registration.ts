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

	_isInvalid:boolean;

	constructor(kwargs?:any) {
		var self = this;
		super(kwargs);

		var target:UserRegistration = new UserRegistration({
			autoSave: true,
			validators: {
				email: [
					new EmailValidator({
						messages: {
							missing: 'Please oh please enter an email address.',
							invalid: 'Please enter something that looks like an email address.'
						}
					})
				],
				name: [
					new RequiredValidator({
						messages: {
							missing: 'Please give us a name.'
						}
					})
				],
				username: [
					new RequiredValidator({
						messages: {
							missing: 'Please give us a user name.'
						}
					})
				],
				password: [
					new RequiredValidator({
						minLength: 6,
						messages: {
							missing: 'Please enter a password.',
							tooShort: 'Please enter a password that is at least 6 characters.'
						}
					})
				],
				passwordVerification: [
					new RequiredValidator({
						messages: {
							missing: 'Please verify your password.'
						}
					}),
					new MatchingStringValidator({
						matchTo: 'password',
						messages: {
							mismatch: 'Your password verification does not match.'
						}
					})
				]
			}
		});

		this.set('target', target);

		this._isInvalid = !target.get('isValid');
		target.observe('isValid', function(isValid){
			self.set('isInvalid', !isValid);
		});
	}

	_todayGetter():Date {
		return new Date();
	}

	_formattedDateOfBirthGetter():string {
		var dob:Date = this.get('target').get('dateOfBirth');
		if (dob) {
			return locale.format(dob, {selector: 'date', datePattern: 'MMMM d, yyyy'});
		}
	}

	_passwordLengthGetter():number {
		var password:string = this.get('target').get('password');
		return password ? password.length : 0;
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
		(key:'app'):WebApplication;
		(key:'formattedDateOfBirth'):string;
		(key:'isInvalid'):string;
		(key:'passwordLength'):number
		(key:'target'):UserRegistration;
		(key:'today'):Date;
	}
	export interface Setters extends Proxy.Setters {
		(key:'app', value:WebApplication):void;
		(key:'isInvalid', value:string):void;
		(key:'target', value:UserRegistration):void;
	}
}

interface IValidatorOptions extends Validator.IOptions {
	messages:HashMap<string>;
}

interface IRequiredValidatorOptions extends IValidatorOptions {
	minLength:number;
}

class RequiredValidator extends Validator {
	options:IRequiredValidatorOptions;

	validate(model:data.IModel, key:string, value:any):void {
		var options:IRequiredValidatorOptions = this.options;
		value = value && lang.trim(value);
		if (value) {
			if (options.minLength > 0 && value.length < options.minLength) {
				model.addError(key, new ValidationError(options.messages['tooShort']));
			}
		} else {
			model.addError(key, new ValidationError(options.messages['missing']));
		}
	}
}

class EmailValidator extends RequiredValidator {
	options:IRequiredValidatorOptions;

	validate(model:data.IModel, key:string, value:any):void {
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

interface IMatchingValidatorOptions extends IValidatorOptions {
	matchTo:string;
}

class MatchingStringValidator extends Validator {
	options:IMatchingValidatorOptions;

	validate(model:data.IModel, key:string, value:any):void {
		if (value) {
			var matchTo:any = model.get(this.options.matchTo);
			if (value !== String(matchTo)) {
				model.addError(key, new ValidationError(this.options.messages['mismatch']));
			}
		}
	}
}

export = Registration;