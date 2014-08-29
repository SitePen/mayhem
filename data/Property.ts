/// <reference path="../dojo" />

import array = require('dojo/_base/array');
import data = require('./interfaces');
import Memory = require('dstore/Memory');
import Observable = require('../Observable');
import Promise = require('../Promise');
import Validator = require('../validation/Validator');
import ValidationError = require('../validation/ValidationError');

class Property<T> extends Observable implements data.IProperty<T> {
	_dependencies:string[];
	_errors:Memory<ValidationError>;
	_key:string;
	_model:data.IModel;
	_label:string;
	_validators:Validator[];
	_validateOnSet:boolean;
	_value:T;
	private _validatorInProgress:IPromise<boolean>;

	get:data.IProperty.Getters<T>;
	set:data.IProperty.Setters<T>;

	constructor(kwArgs?:HashMap<any>) {
		super(kwArgs);

		var self = this;
		this.observe('value', function ():void {
			self._validateOnSet && self.validate();
		});
	}

	addError(error:ValidationError):void {
		this._errors.put(error);
	}

	clearErrors():void {
		this._errors.setData([]);
	}

	/**
	 * @protected
	 */
	_initialize():void {
		super._initialize();
		this._errors = new Memory<ValidationError>();
		this._validators = [];
	}

	validate():IPromise<boolean> {
		if (this._validatorInProgress) {
			this._validatorInProgress.cancel(new Error('Validation restarted'));
		}

		this.clearErrors();

		var self = this;
		var promise:Promise<boolean> = this._validatorInProgress = new Promise<boolean>(function (
			resolve:Promise.IResolver<boolean>,
			reject:Promise.IRejecter,
			progress:Promise.IProgress,
			setCanceler:(canceler:Promise.ICanceler) => void
		):void {
			var validators = self._validators;
			var model = self._model;
			var key = self._key;
			var errors = self._errors;
			var i = 0;
			var currentValidator:Promise<void>;

			setCanceler(function (reason:Error):void {
				currentValidator && currentValidator.cancel(reason);
				i = Infinity;
				throw reason;
			});

			(function runNextValidator():void {
				var validator = validators[i++];

				// end of list of validators for this field reached
				if (!validator) {
					resolve(errors.data.length === 0);
					return;
				}

				// value may also be mutated by validators, so needs to be retrieved after each execution
				var value:any = self.get('value');

				if (validator.options) {
					// Simply skip validators that are defined as allowing empty fields when the value is
					// empty (null, undefined, or empty string)
					if (validator.options.allowEmpty && (value == null || value === '')) {
						runNextValidator();
						return;
					}

					// Skip validators that are limited to certain scenarios and do not match the currently
					// defined model scenario
					if (validator.options.scenarios && validator.options.scenarios.length &&
							array.indexOf(validator.options.scenarios, model.get('scenario')) === -1) {
						runNextValidator();
						return;
					}
				}

				// If a validator throws an error, validation processing halts
				currentValidator = Promise.resolve(validator.validate(model, key, value)).then(runNextValidator, reject);
			})();
		});

		return promise;
	}

	valueOf():T {
		return this.get('value');
	}
}

Property.prototype.set = function (key:any, value?:any):void {
	if (key === 'get') {
		key = 'valueGetter';
	}
	else if (key === 'set') {
		key = 'valueSetter';
	}

	Observable.prototype.set.call(this, key, value);
};

Property.prototype._validateOnSet = true;

export = Property;
