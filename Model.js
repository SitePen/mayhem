define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/Stateful',
	'dojo/Deferred',
	'dojo/when',
	'dojo/i18n!./nls/validator',
	'./validators/ValidationError',
	'./validators/RequiredValidator',
	'./StatefulArray',
	'./util'
], function (declare, lang, array, Stateful, Deferred, when, i18n, ValidationError, RequiredValidator, StatefulArray, util) {
	return declare(Stateful, {
		//	summary:
		//		A base class for modelled data objects.

		//	_validators: [protected] Object
		//		A hash map where the key corresponds to a field name on the
		//		model and the value is an array of
		//		`framework/validator/_Validator` validator objects that are used
		//		to validate that field.
		_validators: {},

		//	_errors: [private] Object
		//		A hash map where the key corresponds to a field name and
		//		the value is an array of `framework/validator/ValidationError`
		//		objects that describe validation failures for that field.
		_errors: {},

		//	_schema: [protected] Object
		//		A hash map where the key corresponds to a field name and the
		//		value is either a string corresponding to one of the JavaScript
		//		primitive values (string, number, boolean), or a constructor, or
		//		null (to allow any type). Only fields that match a key in
		//		`this._schema` are settable using `this.set`.
		_schema: {},

		//	_defaults: [protected] Object
		//		A hash map where the key corresponds to a field name and
		//		the value is a default value for the field. Default values
		//		are not passed through `this.set` so will not be applied by
		//		custom setters. Note that defaults is applied as a shallow
		//		copy, so objects set as default values will be shared across
		//		all instances.
		_defaults: {},

		//	_committedValues: [private] Object
		//		A hash map that stores the currently committed values of the
		//		model.
		_committedValues: {},

		//	scenario: string
		//		The scenario that is used to determine which validators should
		//		apply to this model. There are two standard values for scenario,
		//		"insert" and "update", but it can be set to any arbitrary value
		//		for more complex validation scenarios.
		scenario: 'insert',

		constructor: function (params) {
			this._errors = {};
			lang.mixin(this, this._defaults);
			this._committedValues = lang.mixin({}, this._defaults, params);
		},

		save: function (/*boolean*/ skipValidation) {
			//	summary:
			//		Saves this object. By default, this is a no-op. Implementations should call `commit` after saving
			//		has completed.
			//	skipValidation:
			//		Normally, validation is performed to ensure that the object
			//		is not invalid before being stored. Set `skipValidation` to
			//		true to skip it.
			//	returns: dojo/promise/Promise

			return when(skipValidation ? true : this.validate()).then(function (isValid) {
				if (!isValid) {
					throw new ValidationError(i18n.validationError);
				}
			});
		},

		revert: function () {
			//	summary:
			//		Reverts the object to its currently committed state.

			// Keys must be retrieved from `this._schema` because if all defaults were not explicitly specified for
			// the schema, `this._committedValues` will not have keys for all available fields, and therefore not all
			// available fields will be reverted
			for (var k in this._schema) {
				this.set(k, this._committedValues[k]);
			}
		},

		commit: function () {
			//	summary:
			//		Commits the currently state of the object.

			this.scenario = 'update';
			for (var k in this._schema) {
				this._committedValues[k] = this.get(k);
			}
		},

		set: function (/*string*/ key, /*any?*/ value) {
			//	summary:
			//		Only allows setting keys that are defined in the schema,
			//		and remove any error conditions for the given key when
			//		its value is set.

			if (typeof key === 'object') {
				this.inherited(arguments);
			}
			else if (key in this._schema) {
				// all fields should be allowed to be set to null or undefined regardless of their expected data type
				if (value != null) {
					var DataType = this._schema[key];

					if (DataType === 'string') {
						value = '' + value;
					}
					else if (DataType === 'number') {
						value = +value;
					}
					else if (DataType === 'boolean') {
						// value && value.length check is because dijit/_FormMixin
						// returns an array for checkboxes; an array coerces to true,
						// but an empty array should be set as false
						value = (value === 'false' || value === '0' || value instanceof Array && !value.length) ? false : !!value;
					}
					else if (typeof DataType === 'function' && !(value instanceof DataType)) {
						value = new DataType(value);
					}
				}

				this.inherited(arguments, [ key, value ]);
				this._errors[key] && this._errors[key].splice(0, this._errors[key].get('length'));
			}
			else {
				console.warn('Schema does not contain a definition for', key);
			}
		},

		validate: function (/*string[]?*/ fields) {
			//	summary:
			//		Validates the current object.
			//	fields:
			//		If provided, only the fields listed in the array will be
			//		validated.
			//	returns: dojo/promise/Promise
			//		A promise that resolves to a boolean indicating whether or not the model is in a valid state.

			this.clearErrors();

			var self = this,
				dfd = new Deferred(),
				validators = this._validators,
				validatorKeys = util.getObjectKeys(validators),
				i = 0;

			(function validateNextField() {
				function runNextValidator() {
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

					// If a validator returns false, we stop processing any other validators on this field;
					// if there is an error, validation processing halts
					when(validator.validate(self, key, value)).then(function (continueProcessing) {
						if (continueProcessing === false) {
							validateNextField();
						}
						else {
							runNextValidator();
						}
					}, function (error) {
						dfd.reject(error);
					});
				}

				var key = validatorKeys[i++],
					fieldValidators = validators[key],
					j = 0;

				if (!fieldValidators) {
					dfd.resolve(self.isValid());
				}
				else if (fields && array.indexOf(fields, key) === -1) {
					validateNextField();
				}
				else {
					runNextValidator();
				}
			}());

			return dfd.promise;
		},

		isValid: function () {
			//	summary:
			//		Returns whether or not there are currently any errors on
			//		this model due to validation failures. Note that this does
			//		not run validation but merely returns the result of any
			//		prior validation.
			//	returns: boolean

			var isValid = true,
				key;

			for (key in this._errors) {
				if (this._errors[key].get('length')) {
					isValid = false;
					break;
				}
			}

			return isValid;
		},

		addError: function (/*string*/ key, /*framework/validator/ValidationError*/ error) {
			//	summary:
			//		Adds an error to the current model.
			//	key:
			//		The field onto which an error should be attached.
			//	error:
			//		The error.

			if (!(key in this._errors)) {
				this._errors[key] = new StatefulArray();
			}
			this._errors[key].push(error);
		},

		getErrors: function (/*string?*/ key) {
			//	summary:
			//		Gets errors on the current model.
			//	key:
			//		If provided, return only errors for the given field.
			//	returns: Object|framework/validator/ValidationError[]
			//		If a key is provided, an array of `ValidationError`s is
			//		returned; otherwise, a hash map of all fields with errors
			//		is returned where the key is the field name and the value
			//		is the array of `ValidationError`s.

			// Empty StatefulArray needs to be generated immediately so that anyone trying to get errors for a field
			// will be able to retain a reference and get errors as they appear/disappear
			return key ? (this._errors[key] = this._errors[key] || new StatefulArray()) : this._errors;
		},

		clearErrors: function () {
			//	summary:
			//		Clears all errors currently set on the model.

			var array;
			for (var key in this._errors) {
				array = this._errors[key];
				array.splice(0, array.get('length'));
			}
		},

		isFieldRequired: function (/*String*/ key) {
			// summary:
			//		Asks whether the specified field is required.
			// key:
			//		The field in question
			// returns: boolean
			//		A boolean value indicating whether the field is required.

			var validators = this._validators[key];
			return validators && array.some(validators, function (validator) {
				// TODO: Remove direct dependency on RequiredValidator and replace with checking the validator name
				// and possibly changing validator interface to return an array of errors rather than adding them
				// to the model. That way or providing an additional method on RequiredValidators would allow us
				// to run the validator to discern whether the required constraint applies.
				return validator.isInstanceOf(RequiredValidator);
			});
		}
	});
});
