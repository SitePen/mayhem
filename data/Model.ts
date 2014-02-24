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

	/* private */ _app:core.IApplication;
	private _collection:any /*dstore.Collection*/;
	private _isExtensible:boolean = false;
	private _scenario:string = 'insert';
	/* protected */ _schema:{ [key:string]: data.IProperty<any>; };
	private _validatorInProgress:IPromise<void>;

	constructor(kwArgs?:Object) {
		super(kwArgs);

		for (var key in this._schema) {
			var property:data.IProperty<any> = this._schema[key];
			property.set({
				key: key,
				model: this
			});
		}
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

	get(key:'collection'):any /*dstore.Collection*/;
	get(key:'isExtensible'):boolean;
	get(key:'scenario'):string;
	get(key:string):void;
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

		if (!property && this._isExtensible) {
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
		return when(this._collection.remove(this._collection.getIdentity(this))).then(<T>(returnValue:T):T => {
			this.set('scenario', 'insert');
			return returnValue;
		});
	}

	save(skipValidation?:boolean):IPromise<void> {
		// TODO: Implementation

		return;
	}

	set(key:'isExtensible', value:boolean):void;
	set(key:'scenario', value:string):void;
	set(kwArgs:{ [key:string]: any; }):void;
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

		(function validateNextField():void {
			var key = schemaKeys[i++];

			if (!key) {
				// all fields have been validated
				self._validatorInProgress = null;
				dfd.resolve(self.isValid());
			}
			else if (keysToValidate && array.indexOf(keysToValidate, key) === -1) {
				validateNextField();
			}
			else {
				self._validatorInProgress = schema[key].validate().then(validateNextField, function (error:Error):void {
					dfd.reject(error);
				});
			}
		})();

		return dfd.promise;
	}
}

export = Model;
