import array = require('dojo/_base/array');
import core = require('../interfaces');
import data = require('./interfaces');
import Deferred = require('dojo/Deferred');
import has = require('../has');
import Observable = require('../Observable');
import Property = require('./Property');
import util = require('../util');
import ValidationError = require('../validation/ValidationError');
import when = require('dojo/when');

// TODO: The clarity:
// Model schema is implemented in _schema; this could be implemented another way later, but this is the way we are
// implementing it.
// Each property in the _schema is a property object that contains the metadata for the property
// The value itself is stored on the Model, at property.model[property.key]
// Mediators are just observables, so creating mutable properties for them is very easy

class Model extends Observable implements data.IModel, core.IHasMetadata {
	static property<T>(kwArgs:data.IPropertyArguments<T>):Property<T> {
		return new Property<T>(kwArgs);
	}

	app:core.IApplication;
	collection:any /*dstore.Collection*/;
	isExtensible:boolean;
	scenario:string;
	/* protected */ _schema:{ [key:string]: data.IProperty<any>; };
	private _validatorInProgress:IPromise<void>;

	constructor(kwArgs?:Object) {
		this.isExtensible = false;
		this.scenario = 'insert';

		for (var key in this._schema) {
			var property:data.IProperty<any> = this._schema[key];
			property.set({
				key: key,
				model: this
			});
		}

		super(kwArgs);
	}

	addError(key:string, error:ValidationError):void {
		this._schema[key].get('errors').push(error);
	}

	clearErrors():void {
		for (var key in this._schema) {
			this._schema[key].get('errors').splice(0, Infinity);
		}
	}

	// TODO: Destroy?

	get(key:string):any {
		var property:data.IProperty<any> = this._schema[key];
		return property ? property.get('value') : super.get(key);
	}

	// TODO: _errorsGetter?
	// TODO: ObservableArray?
	getErrors(key?:string):ValidationError[] {
		if (key) {
			return this._schema[key].get('errors');
		}

		var errors:ValidationError[] = [];

		for (var key in this._schema) {
			Array.prototype.push.apply(errors, this._schema[key].get('errors'));
		}

		return errors;
	}

	// TODO: Something else?
	getMetadata(key:string):data.IProperty<any> {
		return this._schema[key];
	}

	private _getProperty(key:string):data.IProperty<any> {
		var property:data.IProperty<any> = this._schema[key];

		if (!property && this.isExtensible) {
			property = this._schema[key] = new Property<any>({
				model: this,
				key: key
			});
		}

		return property;
	}

	isValid():boolean {
		for (var key in this._schema) {
			if (this._schema[key].get('errors').length) {
				return false;
			}
		}

		return true;
	}

	observe(key:string, observer:core.IObserver<any>):IHandle {
		var property = this._getProperty(key);
		return property ? property.observe('value', observer) : super.observe(key, observer);
	}

	remove():IPromise<any> {
		return when(this.collection.remove(this.collection.getIdentity(this))).then((returnValue) => {
			this.set('scenario', 'insert');
			return returnValue;
		});
	}

	save(skipValidation?:boolean):IPromise<void> {
		// TODO: Implementation

		return;
	}

	set(kwArgs:Object):void;
	set(key:string, value:any):void;
	set(key:any, value?:any):void {
		if (util.isObject(key)) {
			var kwArgs:{ [key:string]: any; } = key;
			for (key in kwArgs) {
				this.set(key, kwArgs[key]);
			}

			return;
		}

		var property:data.IProperty<any> = this._getProperty(key);
		if (property) {
			property.set('value', value);
		}
		else if (key in this) {
			super.set(key, value);
		}
	}

	validate(keysToValidate?:string[]):IPromise<boolean> {
		if (this._validatorInProgress) {
			this._validatorInProgress.cancel('Validation restarted');
			this._validatorInProgress = null;
		}

		this.clearErrors();

		var self = this,
			dfd:IDeferred<boolean> = new Deferred<boolean>(),
			schema = this._schema,
			schemaKeys = util.getObjectKeys(schema),
			i = 0;

		(function validateNextField() {
			var key = schemaKeys[i++],
				fieldValidators = key && schema[key].get('validators'),
				j = 0;

			if (!key) {
				// all fields have been validated
				dfd.resolve(self.isValid());
			}
			else if (keysToValidate && array.indexOf(keysToValidate, key) === -1) {
				validateNextField();
			}
			else {
				(function runNextValidator() {
					var validator = fieldValidators[j++];

					// end of list of validators for this field reached
					if (!validator) {
						validateNextField();
						return;
					}

					var value = self.get(key);

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
								array.indexOf(validator.options.scenarios, this.scenario) === -1) {
							runNextValidator();
							return;
						}
					}

					// If a validator throws an error, validation processing halts
					self._validatorInProgress = when(validator.validate(self, key, value)).then(function ():void {
						self._validatorInProgress = null;
						runNextValidator();
					}, function (error) {
						self._validatorInProgress = null;
						dfd.reject(error);
					});
				})();
			}
		})();

		return dfd.promise;
	}
}

export = Model;
