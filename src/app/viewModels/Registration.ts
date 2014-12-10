import data = require('mayhem/data/interfaces');
import lang = require('dojo/_base/lang');
import Proxy = require('mayhem/data/Proxy');
import UserRegistration = require('../models/UserRegistration');
import ValidationError = require('mayhem/validation/ValidationError');
import Validator = require('mayhem/validation/Validator');
import WebApplication = require('mayhem/WebApplication');
import locale = require('dojo/date/locale');

function quietMissingErrors(fieldKey:string, errorKey:string):string {
	//return fieldKey;
	return errorKey === 'missing' ? 'quiet' : fieldKey;
}

class Registration extends Proxy<UserRegistration> {
	get:Registration.Getters;
	set:Registration.Setters;

	_isInvalid:boolean;
	_notesLength:number;
	_notesMaxLength:number;

	constructor(kwargs?:any) {
		var self = this;
		this._notesMaxLength = 500;
		super(kwargs);

		this._notesLength = 0;

		var target:UserRegistration = new UserRegistration({
			autoSave: true,
			autoValidate: true, // all, single, false
			validators: {
				email: [
					new EmailValidator({
						fieldKey: quietMissingErrors,
						messages: {
							missing: 'Please oh please enter an email address.',
							invalid: 'Please enter something that looks like an email address.'
						}
					})
				],
				name: [
					new RequiredValidator({
						fieldKey: quietMissingErrors,
						messages: {
							missing: 'Please give us a name.'
						}
					})
				],
				password: [
					new RequiredValidator({
						minLength: 6,
						fieldKey: quietMissingErrors,
						messages: {
							missing: 'Please enter a password.',
							tooShort: 'Please enter a password that is at least 6 characters.'
						}
					})
				],
				passwordVerification: [
					new RequiredValidator({
						fieldKey: quietMissingErrors,
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
				],
				username: [
					new RequiredValidator({
						fieldKey: quietMissingErrors,
						messages: {
							missing: 'Please give us a user name.'
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
		target.observe('notes', function (notes) {
			self.set('notesLength', notes ? notes.length: 0);
		});
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

	_todayGetter():Date {
		return new Date();
	}

	cancel():void {
		this.get('target').reset();
		this.get('app').get('router').go('index');
	}

	complete():void {
		// TBD: reset the model
		this.get('target').reset();
		this.get('app').get('router').go('thanks');
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
}

module Registration {
	export interface Getters extends Proxy.Getters {
		(key:'app'):WebApplication;
		(key:'formattedDateOfBirth'):string;
		(key:'isInvalid'):string;
		(key:'notesLength'):number;
		(key:'notesMaxLength'):number;
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
	fieldKey:(defaultKey:string, errorKey:string) => string;
	messages:HashMap<string>;
}

interface IRequiredValidatorOptions extends IValidatorOptions {
	minLength:number;
}

class MyValidator extends Validator {
	options:IValidatorOptions;

	protected _addError(model:data.IModel, key:string, errorKey:string):void {
		var fieldKeyFn = this.options.fieldKey;
		var fieldKey = fieldKeyFn ? fieldKeyFn(key, errorKey) : key;

		model.addError(fieldKey, new ValidationError(this.options.messages[errorKey]));
	}
}

class RequiredValidator extends MyValidator {
	options:IRequiredValidatorOptions;

	validate(model:data.IModel, key:string, value:any):void {
		var options:IRequiredValidatorOptions = this.options;
		value = value && lang.trim(value);
		if (value) {
			if (options.minLength > 0 && value.length < options.minLength) {
				this._addError(model, key, 'tooShort');
			}
		} else {
			this._addError(model, key, 'missing');
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
					this._addError(model, key, 'invalid');
				}
			}
		}
	}
}

interface IMatchingValidatorOptions extends IValidatorOptions {
	matchTo:string;
}

class MatchingStringValidator extends MyValidator {
	options:IMatchingValidatorOptions;

	validate(model:data.IModel, key:string, value:any):void {
		if (value) {
			var matchTo:any = model.get(this.options.matchTo);
			if (value !== String(matchTo)) {
				this._addError(model, key, 'mismatch');
			}
		}
	}
}

export = Registration;