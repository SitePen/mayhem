/// <reference path="../dojo" />

import array = require('dojo/_base/array');
import core = require('../interfaces');
import data = require('./interfaces');
import Deferred = require('dojo/Deferred');
import Observable = require('../Observable');
import ObservableArray = require('../ObservableArray');
import Proxty = require('../Proxty');
import ValidationError = require('../validation/ValidationError');
import when = require('dojo/when');

class Property<T> extends Observable implements data.IProperty<T> {
	private _errors:ObservableArray<ValidationError>;
	private _key:string;
	private _model:data.IModel;
	private _label:string;
	private _validators:core.IValidator[];
	private _validateOnSet:boolean;
	private _value:T;
	private _valueGetter:() => T;
	private _validatorInProgress:IPromise<void>;

	constructor(kwArgs?:data.IPropertyArguments<T>) {
		this._errors = new ObservableArray<ValidationError>();
		this._validators = [];
		this._validateOnSet = true;

		super(kwArgs);
	}

	get(key:'errors'):ObservableArray<ValidationError>;
	get(key:'key'):string;
	get(key:'model'):data.IModel;
	get(key:'label'):string;
	get(key:'validators'):core.IValidator[];
	get(key:'validateOnSet'):boolean;
	get(key:'value'):T;
	get(key:string):any;
	get():Object;
	get(key?:string):any {
		if (key == null) {
			var serialized:Object = {};
			for (var key in this) {
				if (key.charAt(0) !== '_' || typeof this[key] === 'function') {
					continue;
				}

				serialized[key.slice(1)] = this[key];
			}
			return serialized;
		}

		return super.get(key);
	}

	observe<T>(key:string, observer:core.IObserver<T>):IHandle {
		var handle = super.observe(key, observer);

		// TODO: This is a hack to enable observers to be notified whenever the errors array is mutated; there needs
		// to be a proper way to observe these types of arrays instead in the binding system.
		if (key === 'errors') {
			this._errors.observe(():void => {
				this._notify(this._errors, this._errors, 'errors');
			});
		}

		return handle;
	}

	set(key:'errors'):ObservableArray<ValidationError>;
	set(key:'key'):string;
	set(key:'model'):data.IModel;
	set(key:'label'):string;
	set(key:'validators'):core.IValidator[];
	set(key:'validateOnSet'):boolean;
	set(key:'value'):T;
	set(kwArgs:{ [key:string]: any; }):void;
	set(key:string, value:any):void;
	set(key:string, value?:any):void {
		super.set(key, value);
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

export = Property;
