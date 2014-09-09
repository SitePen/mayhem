/// <reference path="../dojo" />

import array = require('dojo/_base/array');
import binding = require('../binding/interfaces');
import core = require('../interfaces');
import data = require('./interfaces');
import Memory = require('dstore/Memory');
import Observable = require('../Observable');
import Promise = require('../Promise');
import util = require('../util');
import Validator = require('../validation/Validator');
import ValidationError = require('../validation/ValidationError');

class Property<T> extends Observable implements data.IProperty<T> {
	private _app:core.IApplication;
	_dependencies:string[];
	private _dependencyBindings:binding.IBinding<any, any>[];
	_errors:ValidationError[];
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
		util.deferMethods(this, [ '_updateDependencies' ], 'startup');
		super(kwArgs);

		var self = this;
		this.observe('value', function ():void {
			self._validateOnSet && self.validate();
		});
	}

	addError(error:ValidationError):void {
		this._errors.push(error);
	}

	_appSetter(value:core.IApplication):void {
		this._app = value;
		if (this._model && this._dependencies.length) {
			this._updateDependencies();
		}
	}

	private _clearDependencies():void {
		var bindings:binding.IBinding<any, any>[] = this._dependencyBindings;
		var binding:binding.IBinding<any, any>;
		while ((binding = bindings.pop())) {
			binding.destroy();
		}
	}

	clearErrors():void {
		this._errors.splice(0, Infinity);
	}

	destroy():void {
		this._clearDependencies();
		super.destroy();
	}

	/**
	 * @protected
	 */
	_dependenciesSetter(value:string[]):void {
		this._dependencies = value;
		if (this._app && this._model) {
			this._updateDependencies();
		}
	}

	/**
	 * @protected
	 */
	_initialize():void {
		super._initialize();
		this._errors = [];
		this._validators = [];
		this._dependencies = [];
		this._dependencyBindings = [];
	}

	/**
	 * @protected
	 */
	_modelSetter(value:data.IModel):void {
		this._model = value;
		if (value && this._app && this._dependencies.length) {
			this._updateDependencies();
		}
	}

	private _updateDependencies():void {
		this._clearDependencies();

		var dependencies:string[] = this._dependencies;
		var bindings:binding.IBinding<any, any>[] = this._dependencyBindings;
		var model:data.IModel = this._model;
		var binder:binding.IBinder = this._app.get('binder');
		var self = this;
		for (var i = 0, path:string; (path = dependencies[i]); ++i) {
			console.log('updating dependency', path);
			var binding:binding.IBinding<any, any> = binder.createBinding(model, path, { scheduled: false });
			binding.bindTo(<binding.IBinding<any, any>> {
				set: function (value:any):void {
					console.log('need to update value', self._key);
					self._notify('value', self.get('value'), undefined);
				}
			});

			bindings.push(binding);
		}
	}

	startup():void {}

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
					resolve(errors.length === 0);
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
