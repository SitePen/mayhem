import array = require('dojo/_base/array');
import core = require('../interfaces');
import data = require('./interfaces');
import Deferred = require('dojo/Deferred');
import has = require('../has');
import lang = require('dojo/_base/lang');
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
	static property<T>(kwArgs:data.IPropertyArguments<T>):any {
		return {
			type: (kwArgs:data.IPropertyArguments<T>):Property<T> => {
				return new Property<T>(kwArgs);
			},
			kwArgs: kwArgs
		};
	}

	static schema(ctor:Function, schemaCreator:(parentSchema?:any) => any):void {
		var oldSchema:any = ctor.prototype._schema;
		ctor.prototype._schema = schemaCreator(oldSchema);
	}

	/* private */ _app:core.IApplication;
	private _collection:any /*dstore.Collection*/;
	private _isExtensible:boolean = false;
	private _scenario:string = 'insert';
	private _validatorInProgress:IPromise<void>;
	_schema:any;

	get:data.IModelGet;
	set:data.IModelSet;

	/* protected */ _getSchema():Model.ISchema {
		var schema:any = {};
		for (var key in this._schema) {
			var item:{ type:{ new (kwArgs:data.IPropertyArguments<any>):data.IProperty<any> }; kwArgs:data.IPropertyArguments<any>; } = this._schema[key];
			schema[key] = new item.type(lang.mixin(<any>{}, item.kwArgs, {
				key: key,
				model: this
			}));
		}

		this._getSchema = ():Model.ISchema => {
			return schema;
		};

		return schema;
	}

	addError(key:string, error:ValidationError):void {
		this._getSchema()[key].get('errors').push(error);
	}

	clearErrors():void {
		var schema = this._getSchema();
		for (var key in schema) {
			schema[key].get('errors').splice(0, Infinity);
		}
	}

	// TODO: Destroy?
	// TODO: _errorsGetter?
	// TODO: ObservableArray?
	getErrors(key?:string):ValidationError[] {
		var schema:Model.ISchema = this._getSchema();
		if (key) {
			return schema[key].get('errors');
		}

		var errors:ValidationError[] = [];

		for (key in schema) {
			Array.prototype.push.apply(errors, schema[key].get('errors'));
		}

		return errors;
	}

	// TODO: Something else?
	getMetadata(key:string):data.IProperty<any> {
		return this._getSchema()[key];
	}

	private _getProperty(key:string):data.IProperty<any> {
		var schema:Model.ISchema = this._getSchema(),
			property:data.IProperty<any> = schema[key];

		if (!property && this._isExtensible) {
			property = schema[key] = new Property<any>({
				model: this,
				key: key
			});
		}

		return property;
	}

	isValid():boolean {
		var schema = this._getSchema();
		for (var key in schema) {
			if (schema[key].get('errors').length) {
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

	validate(keysToValidate?:string[]):IPromise<boolean> {
		if (this._validatorInProgress) {
			this._validatorInProgress.cancel('Validation restarted');
			this._validatorInProgress = null;
		}

		this.clearErrors();

		var self = this,
			dfd:IDeferred<boolean> = new Deferred<boolean>(),
			schema = this._getSchema(),
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

Model.prototype.get = function(key:string):any {
	var property:data.IProperty<any> = this._getSchema()[key];
	return property ? property.get('value') : Observable.prototype.get.call(this, key);
};

Model.prototype.set = function(key:any, value?:any):void {
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
		Observable.prototype.set.call(this, key, value);
	}
};

module Model {
	export interface ISchema {
		[key:string]:data.IProperty<any>;
	}
}

export = Model;
