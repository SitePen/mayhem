import Base = require('../Base');
import has = require('../has');
import LogLevel = require('../logging/LogLevel');
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
		committedValues: true,
		currentScenarioKeys: true,
		errors: true,
		isDirty: true,
		_isDirty: true,
		isValid: true,
		scenario: true,
		_scenario: true,
		scenarios: true,
		suppressNotifications: true,
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
	errors: { [modelKey: string]: ValidationError[]; };

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

		return !this.hasErrors();
	}

	/**
	 * The current scenario of the model.
	 */
	get scenario(): string {
		return this._scenario;
	}
	set scenario(value: string) {
		var scenarios = <HashMap<string[]>> this.scenarios;
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
	protected _scenario: string;

	/**
	 * A list of valid scenarios for this object, and the keys that are valid for each scenario.
	 * @type { [scenario: string]: string[]; }
	 */
	scenarios: {};

	/**
	 * Whether or not to suppress notifications that would normally be dispatched for computed properties in response
	 * to a property change.
	 */
	private suppressNotifications: boolean;

	/**
	 * A promise for the validation currently in progress for this model.
	 */
	private validatorInProgress: Promise<boolean>;

	/**
	 * A list of validators for each field on this model.
	 * @type { [modelKey: string]: Validator[]; }
	 */
	validators: {};

	/**
	 * Mass assigns values on the model, preventing assignment of keys not defined by the current scenario
	 * or keys that are used for the internal metadata of the model itself.
	 */
	get values(): {} {
		return this.toJSON();
	}
	set values(data: {}) {
		var nonDataKeys = (<typeof Model> this.constructor).nonDataKeys;

		this.suppressNotifications = true;
		try {
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
		}
		finally {
			this.suppressNotifications = false;
		}

		this.notify('isDirty');

		if (this.autoValidate) {
			this.validate();
		}
	}

	constructor(kwArgs?: Model.KwArgs) {
		this.suppressNotifications = true;
		super(kwArgs);
		this.suppressNotifications = false;

		// The scenario in `initialize` was set by bypassing the setter, but now we need to to make sure
		// `currentScenarioKeys` is set up correctly if no scenario override was provided at startup
		if (!('scenario' in kwArgs)) {
			this.scenario = this._scenario;
		}

		// Mass-assigned properties from the constructor are initial state and should not cause the model to become
		// dirty
		this.commit();
		this.initializePropertyTraps();
	}

	protected initialize() {
		super.initialize();
		this.autoValidate = false;
		this.committedValues = {};
		this.errors = {};
		// Avoiding the mutator because subclasses may have a different default scenario and hitting the mutator
		// in that case would trigger an "invalid scenario" error
		this._scenario = 'default';
	}

	/**
	 * Adds an error to the object.
	 */
	addError(key: string, error: ValidationError): void {
		var wasValid = this.isValid;
		var allErrors = this.errors;

		var errors = allErrors[key] || (allErrors[key] = []);
		errors.push(error);

		if (wasValid) {
			this.notify('isValid', wasValid);
		}
	}

	/**
	 * Clears errors currently set on the object.
	 */
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

		if (!wasValid) {
			this.notify('isValid', wasValid);
		}
	}

	/**
	 * Commits the current values set on the model.
	 */
	commit(): void {
		var wasDirty = this.isDirty;

		if (wasDirty) {
			var committedValues: HashMap<any> = this.committedValues = {};
			var nonDataKeys = (<typeof Model> this.constructor).nonDataKeys;
			for (var key in this) {
				if (hasOwnProperty.call(this, key) && !nonDataKeys[key]) {
					committedValues[key] = (<any> this)[key];
				}
			}

			this._isDirty = false;
			this.notify('isDirty', wasDirty);
		}
	}

	destroy(): void {
		this.validatorInProgress && this.validatorInProgress.cancel(new Error('Model is being destroyed'));
		this.errors = this.committedValues = this.validatorInProgress = null;
		super.destroy();
	}

	/**
	 * Calculates whether or not the current model has any errors.
	 */
	protected hasErrors(key?: string): boolean {
		var errors = this.errors;

		if (key) {
			if (errors[key] && errors[key].length) {
				return true;
			}
		}
		else {
			for (key in errors) {
				if (errors[key] && errors[key].length) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Adds mutators to all known properties for this model that allow the dirty state of the model to be updated in
	 * response to a property change.
	 */
	protected initializePropertyTraps(): void {
		// TODO: autoValidate, or move autoSave/autoValidate stuff to somewhere else like the view system
		if (has('es7-object-observe')) {
			var self = this;
			var nonDataKeys = (<typeof Model> this.constructor).nonDataKeys;
			(<any> Object).observe(this, function (changes: Array<{ name: string; object: Model; type: string; oldValue: any; }>) {
				changes.some(function (change) {
					if (!nonDataKeys[change.name]) {
						self.notify('isDirty');
						return true;
					}
				});
			});
		}
		else {
			var scenarios = <HashMap<string[]>> this.scenarios;

			if (!scenarios) {
				this.app.log('Model has no defined scenarios, so isDirty will not notify', LogLevel.WARN, module.id);
				return;
			}

			var definedScenarioKeys: HashMap<boolean> = {};

			for (var scenarioName in scenarios) {
				scenarios[scenarioName].forEach(function (key) {
					definedScenarioKeys[key] = true;
				});
			}

			for (var key in definedScenarioKeys) {
				this.observe(key, () => {
					if (!this.suppressNotifications) {
						this.notify('isDirty');
					}
				});
			}
		}
	}

	/**
	 * Reverts the current values set on the model to the previously committed values.
	 */
	revert(keysToRevert?: string[]): void {
		var wasDirty = this.isDirty;
		var committedValues = this.committedValues;

		if (wasDirty) {
			this.suppressNotifications = true;
			try {
				if (keysToRevert) {
					for (var i = 0, j = keysToRevert.length; i < j; ++i) {
						if (hasOwnProperty.call(committedValues, key)) {
							(<any> this)[key] = committedValues[key];
						}
					}
				}
				else {
					for (var key in committedValues) {
						if (hasOwnProperty.call(committedValues, key)) {
							(<any> this)[key] = committedValues[key];
						}
					}
				}
			}
			finally {
				this.suppressNotifications = false;
			}

			this._isDirty = false;
			this.notify('isDirty', wasDirty);
		}
	}

	toJSON(): {} {
		var nonDataKeys = (<typeof Model> this.constructor).nonDataKeys;
		var serialization: HashMap<any> = {};

		for (var key in this) {
			if (!hasOwnProperty.call(this, key) || nonDataKeys[key]) {
				continue;
			}

			serialization[key] = (<any> this)[key];
		}

		return serialization;
	}

	/**
	 * Validates the model according to the current scenario.
	 */
	validate(keysToValidate?: string[]): Promise<boolean> {
		if (this.validatorInProgress) {
			this.validatorInProgress.cancel(new Error('Validation restarted'));
			this.validatorInProgress = null;
		}

		this.clearErrors();

		var self = this;
		var promise = this.validatorInProgress = new Promise<boolean>(function (resolve, reject, progress, setCanceler) {
			var validators = <HashMap<Validator[]>> self.validators;

			if (!validators) {
				resolve(!self.hasErrors());
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
					currentValidator = null;
					resolve(!self.hasErrors());
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
							// TODO: Remove cast to <any> as soon as possible
							currentValidator = Promise.resolve(validator.validate(<any> self, key, (<any> self)[key]))
								.then(runNextValidator, reject);
						}
						else {
							validateNextField();
						}
					})();
				}
			})();
		}).then(function (isValid) {
			self.validatorInProgress = null;
			self.notify('isValid');
			return isValid;
		}, function (error): any {
			self.validatorInProgress = null;
			self.notify('isValid');
			throw error;
		});

		return promise;
	}
}

module Model {
	export interface KwArgs extends Base.KwArgs {
		autoValidate?: boolean;
		scenario?: string;
	}
}

export = Model;
