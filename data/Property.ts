/// <reference path="../dojo" />

import array = require('dojo/_base/array');
import core = require('../interfaces');
import data = require('./interfaces');
import Deferred = require('dojo/Deferred');
import lang = require('dojo/_base/lang');
import Observable = require('../Observable');
import ObservableArray = require('../ObservableArray');
import Proxty = require('../Proxty');
import when = require('dojo/when');

class Property<T> extends Observable implements data.IProperty<T> {
	_dependencies:string[];
	_errors:ObservableArray<core.IValidationError>;
	_key:string;
	_model:data.IModel;
	_label:string;
	_validators:core.IValidator[];
	_validateOnSet:boolean;
	_value:T;
	_validatorInProgress:IPromise<void>;

	private _valueGetter:() => T;

	get:data.IPropertyGet<T>;
	set:data.IPropertySet<T>;

	constructor(kwArgs?:any) {
		this._errors = new ObservableArray<core.IValidationError>();
		this._validators = [];

		super(kwArgs);
	}

	observe<T>(key:string, observer:core.IObserver<T>):IHandle {
		var handle = super.observe(key, observer);

		// TODO: This is a hack to enable observers to be notified whenever the errors array is mutated; there needs
		// to be a proper way to observe these types of arrays instead in the binding system.
		if (key === 'errors') {
			this._errors.observe(():void => {
				var errors:ObservableArray<core.IValidationError> = this._errors;
				this._notify(errors, errors, 'errors');
			});
		}

		return handle;
	}

	validate():IPromise<boolean> {
		var dfd:IDeferred<boolean> = new Deferred<boolean>(<T>(reason:T):T => {
				if (this._validatorInProgress) {
					this._validatorInProgress.cancel(reason);
					this._validatorInProgress = null;
				}

				return reason;
			}),
			self = this,
			model = this.get('model'),
			key = this.get('key'),
			validators = this.get('validators'),
			errors = this.get('errors'),
			i = 0;

		if (this._validatorInProgress) {
			this._validatorInProgress.cancel('Validation restarted');
			this._validatorInProgress = null;
		}

		errors.splice(0, Infinity);

		(function runNextValidator():void {
			var validator = validators[i++],
				value:any = self.get('value');

			// end of list of validators for this field reached
			if (!validator) {
				dfd.resolve(errors.length === 0);
				return;
			}

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
			self._validatorInProgress = when(validator.validate(model, key, value)).then(function ():void {
				self._validatorInProgress = null;
				runNextValidator();
			}, function (error:Error):void {
				self._validatorInProgress = null;
				dfd.reject(error);
			});
		})();

		return dfd.promise;
	}

	valueOf():T {
		return this.get('value');
	}

	_valueGetterSetter(getter:() => T):void {
		this._valueGetter = getter;
	}

	_valueSetter(value:T):void {
		this._value = value;
		this._validateOnSet && this.validate();
	}

	_valueSetterSetter(setter:(value:T) => void):void {
		this._valueSetter = function ():void {
			setter.apply(this, arguments);
			this._validateOnSet && this.validate();
		};
	}
}

Property.defaults({
	dependencies: null,
	errors: null,
	model: null,
	validators: null,
	validateOnSet: true
});

lang.mixin(Property.prototype, {
	get: function (key?:string):any {
		if (key == null) {
			var serialized:Object = {};
			for (var property in this) {
				if (property.charAt(0) !== '_' || typeof this[property] === 'function') {
					continue;
				}

				serialized[property.slice(1)] = this[property];
			}
			return serialized;
		}

		return Observable.prototype.get.call(this, key);
	},

	set: function (key:any, value?:any):void {
		if (key === 'get') {
			key = 'valueGetter';
		}
		else if (key === 'set') {
			key = 'valueSetter';
		}
		Observable.prototype.set.call(this, key, value);
	}
});

export = Property;
