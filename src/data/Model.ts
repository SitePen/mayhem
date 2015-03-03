import Base = require('../Base');
import core = require('../interfaces');
import data = require('./interfaces');
import has = require('../has');
import LogLevel = require('../LogLevel');
import module = require('module');
import Promise = require('../Promise');
import util = require('../util');
import ValidationError = require('../validation/ValidationError');
import Validator = require('../validation/Validator');

var hasOwnProperty = Object.prototype.hasOwnProperty;

class Model extends Base {
	protected static nonDataKeys: HashMap<boolean> = {
		app: true,
		autoValidate: true,
		currentScenarioKeys: true,
		dirtyProperties: true,
		errors: true,
		initializing: true,
		isDirty: true,
		isValid: true,
		scenario: true,
		scenarios: true,
		validatorInProgress: true,
		validators: true
	};

	/**
	 * Causes the model to revalidate every time a property is set.
	 */
	autoValidate: boolean;

	/**
	 * The known committed data for this object.
	 */
	private committedValues: HashMap<any>;

	/**
	 * A lookup map of keys that can be set for the current scenario.
	 */
	private currentScenarioKeys: HashMap<boolean>;

	/**
	 * A map of errors associated with this model.
	 */
	errors: { [modelKey: string]: ValidationError[] };

	/**
	 * Whether or not the model is currently initialising.
	 */
	private initializing: boolean;

	/**
	 * Whether or not this model has uncommitted changes.
	 */
	get isDirty(): boolean {
		if (this._isDirty) {
			return true;
		}

		var nonDataKeys = (<typeof Model> this.constructor).nonDataKeys;

		for (var key in this) {
			if (nonDataKeys[key]) {
				continue;
			}

			if (hasOwnProperty.call(this, key) && this.committedValues[key] !== (<any> this)[key]) {
				this._isDirty = true;
				return true;
			}
		}

		return false;
	}
	private _isDirty: boolean;

	/**
	 * Whether or not this model is valid according to its validators. The `validate` method must be called before
	 * accessing this property.
	 */
	get isValid(): boolean {
		// TODO: Make this configurable
		if (this.validatorInProgress) {
			return false;
		}

		var errors = this.errors;
		for (var key in errors) {
			if (errors[key] && errors[key].length) {
				return false;
			}
		}

		return true;
	}

	/**
	 * The current scenario of the model.
	 */
	get scenario(): string {
		return this._scenario;
	}
	set scenario(value: string) {
		var scenarios = this.scenarios;
		if (scenarios && !scenarios[value]) {
			throw new Error('Invalid scenario "' + value + '"');
		}

		this._scenario = value;

		// Users may choose not to define scenarios explicitly, in which case any scenario name is allowed
		// and all keys are allowed
		if (scenarios) {
			var scenario = scenarios[value];
			var keys: HashMap<boolean> = this.currentScenarioKeys = {};
			for (var i = 0, j = scenario.length; i < j; ++i) {
				keys[scenario[i]] = true;
			}
		}
		else {
			this.currentScenarioKeys = null;
		}
	}
	private _scenario: string;

	/**
	 * A list of valid scenarios for this object, and the keys that are valid for each scenario.
	 */
	scenarios: { [scenario: string]: string[]; };

	/**
	 * A promise for the validation currently in progress for this model.
	 */
	private validatorInProgress: Promise<boolean>;

	/**
	 * A list of validators for each field on this model.
	 */
	validators: { [modelKey: string]: Validator[]; };

	constructor(kwArgs?: Model.KwArgs) {
		this.initializing = true;
		super(kwArgs);
		this.initializing = false;

		// Mass-assigned properties from the constructor are initial state and should not cause the model to become
		// dirty
		this.commit();
		this.initializePropertyTraps();
	}

	protected initialize(): void {
		super.initialize();
		this.autoValidate = false;
		this.errors = {};
		this.scenario = 'default';
	}

	addError(key: string, error: ValidationError): void {
		var wasValid:boolean = this.isValid;

		var errors:ValidationError[] = this.errors[key] || (this.errors[key] = []);
		errors.push(error);

		this.notify('isValid', wasValid);
	}

	clearErrors(key?: string): void {
		var wasValid = this.isValid;
		var errors = this.errors;

		if (key) {
			errors[key] && errors[key].splice(0, Infinity);
		}
		else {
			for (key in errors) {
				errors[key] && errors[key].splice(0, Infinity);
			}
		}

		this.notify('isValid', wasValid);
	}

	commit(): void {
		var wasDirty = this.isDirty;

		if (wasDirty) {
			var committedValues: HashMap<any> = this.committedValues = {};
			for (var key in this) {
				if (hasOwnProperty.call(this, key)) {
					committedValues[key] = (<any> this)[key];
				}
			}

			this.notify('isDirty', wasDirty);
		}
	}

	destroy(): void {
		this.validatorInProgress && this.validatorInProgress.cancel(new Error('Model is being destroyed'));
		this.errors = this.committedValues = this.validatorInProgress = null;
		super.destroy();
	}

	protected initializePropertyTraps(): void {
		var scenarios = this.scenarios;

		if (!scenarios) {
			this.app.log('Model has no defined scenarios, so dirty properties may not be found', LogLevel.WARN, module.id);
			return;
		}

		var allKeys: HashMap<boolean> = {};

		for (var scenarioName in scenarios) {
			scenarios[scenarioName].forEach(function (key) {
				allKeys[key] = true;
			});
		}

		for (var key in allKeys) {
			(function (self: Model) {
				var value: any = (<any> self)[key];

				Object.defineProperty(this, key, {
					get: function () {
						return value;
					},
					set: function (_value: any) {
						value = _value;
						self.notify('isDirty');
					}
				});
			})(key);
		}
	}

	revert(keysToRevert?: string[]): void {
		var wasDirty = this.isDirty;
		var committedValues = this.committedValues;

		if (wasDirty) {
			if (keysToRevert) {
				for (var i = 0, j = keysToRevert.length; i < j; ++i) {
					if (key in committedValues) {
						(<any> this)[key] = committedValues[key];
					}
				}
			}
			else {
				for (var key in committedValues) {
					(<any> this)[key] = committedValues[key];
				}
			}
		}

		this.notify('isDirty', wasDirty);
	}

	setValues(data: {}): void {
		var nonDataKeys = (<typeof Model> this.constructor).nonDataKeys;

		for (var key in data) {
			var value: any = (<any> data)[key];

			if (this.currentScenarioKeys ? !this.currentScenarioKeys[key] : nonDataKeys[key]) {
				this.app.log(
					'Not setting key "' + key + '" because it is not valid for the current scenario',
					LogLevel.WARN,
					module.id
				);
				continue;
			}

			(<any> this)[key] = value;
		}

		this.notify('isDirty');

		if (this.autoValidate) {
			this.validate();
		}
	}

	toJSON(): {} {
		var nonDataKeys = (<typeof Model> this.constructor).nonDataKeys;
		var serialization: HashMap<any> = {};

		for (var key in this) {
			if (!hasOwnProperty.call(this, key) || key in nonDataKeys) {
				continue;
			}

			serialization[key] = (<any> this)[key];
		}

		return serialization;
	}

	validate(keysToValidate?: string[]): Promise<boolean> {
		if (this.validatorInProgress) {
			this.validatorInProgress.cancel(new Error('Validation restarted'));
			this.validatorInProgress = null;
		}

		this.clearErrors();

		var self = this;
		var promise = this.validatorInProgress = new Promise<boolean>(function (resolve, reject, progress, setCanceler) {
			var validators = self.validators;

			if (!validators) {
				resolve(self.isValid);
				return;
			}

			var propertiesKeys = util.getObjectKeys(validators);
			var i = 0;
			var currentValidator: Promise<void>;

			setCanceler(function (reason) {
				currentValidator && currentValidator.cancel(reason);
				i = Infinity;
				throw reason;
			});

			(function validateNextField() {
				var key = propertiesKeys[i++];

				if (!key) {
					// all fields have been validated
					self.validatorInProgress = currentValidator = null;
					this.notify('isValid');
					resolve(self.isValid);
				}
				else if (keysToValidate && keysToValidate.indexOf(key) === -1) {
					validateNextField();
				}
				else {
					var j = 0;
					var fieldValidators = validators[key];
					(function runNextValidator() {
						var validator = fieldValidators[j++];
						if (validator) {
							currentValidator = Promise
								.resolve(validator.validate(self, key, (<any> self)[key]))
								.then(runNextValidator, reject);
						}
						else {
							validateNextField();
						}
					})();
				}
			})();
		});

		this.notify('isValid');
		return promise;
	}
}

module Model {
	export interface KwArgs extends Base.KwArgs {
		scenario?: string;
	}
}

export = Model;
