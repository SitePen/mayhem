import array = require('dojo/_base/array');
import core = require('../interfaces');
import data = require('./interfaces');
import Deferred = require('dojo/Deferred');
import has = require('../has');
import lang = require('dojo/_base/lang');
import Observable = require('../Observable');
import Property = require('./Property');
import util = require('../util');
import when = require('dojo/when');

// TODO: The clarity:
// Model schema is implemented in _schema; this could be implemented another way later, but this is the way we are
// implementing it.
// Each property in the _schema is a property object that contains the metadata for the property
// The value itself is stored on the Model, at property.model[property.key]
// Mediators are just observables, so creating mutable properties for them is very easy

class Model extends Observable implements data.IModel, core.IHasMetadata {
	static property<T>(propertyKwArgs:data.IPropertyArguments<T>):any {
		return (kwArgs:data.IPropertyArguments<T>):Property<T> => {
			return new Property<T>(lang.mixin({}, propertyKwArgs, kwArgs));
		};
	}

	static schema(schemaCreator:(parentSchema?:Model.ISchema) => Model.ISchema):void {
		var ctor:Function = this,
			oldSchema:any = ctor.prototype._schema;

		ctor.prototype._schema = schemaCreator(oldSchema);
	}

	_schema:Model.ISchema;
	/* protected */ _values:{
		app:core.IApplication;
		collection:any /*dstore.Collection*/;
		isExtensible:boolean;
		scenario:string;
		validatorInProgress:IPromise<void>;
	};

	get:data.IModelGet;
	set:data.IModelSet;

	addError(key:string, error:core.IValidationError):void {
		this._getProperties()[key].get('errors').push(error);
	}

	clearErrors():void {
		var properties = this._getProperties();
		for (var key in properties) {
			properties[key].get('errors').splice(0, Infinity);
		}
	}

	destroy():void {
		super.destroy();
		this._getProperties = null;
	}

	// TODO: Destroy?
	// TODO: _errorsGetter?
	// TODO: ObservableArray?
	getErrors(key?:string):core.IValidationError[] {
		var properties:Model.IProperties = this._getProperties();
		if (key) {
			return properties[key].get('errors');
		}

		var errors:core.IValidationError[] = [];

		for (key in properties) {
			Array.prototype.push.apply(errors, properties[key].get('errors'));
		}

		return errors;
	}

	// TODO: Something else?
	getMetadata(key:string):data.IProperty<any> {
		return this._getProperties()[key];
	}

	/* protected */ _getProperties():Model.IProperties {
		var properties:any = {};
		for (var key in this._schema) {
			var PropertyCtor:Model.IPropertyConstructor<any> = this._schema[key];
			properties[key] = new PropertyCtor({
				key: key,
				model: this
			});
		}

		this._getProperties = ():Model.IProperties => {
			return properties;
		};

		var connectDependency = (property:any, sourceName:string, destinationName:string):void => {
			this.observe(sourceName, ():void => {
				property._notify(property.get('value'), undefined, 'value');
			});
		};
		for (key in properties) {
			var property:any = properties[key],
				dependencies:any = property.get('dependencies');

			if (!dependencies) {
				continue;
			}

			if (dependencies instanceof Array) {
				for (var i = 0; i < dependencies.length; i++) {
					connectDependency.call(this, property, dependencies[i], dependencies[i]);
				}
			}
			else {
				for (var name in dependencies) {
					connectDependency.call(this, property, dependencies[name], name);
				}
			}
		}

		return properties;
	}

	private _getProperty(key:string):data.IProperty<any> {
		var properties:Model.IProperties = this._getProperties(),
			property:data.IProperty<any> = properties[key];

		if (!property && this.get('isExtensible')) {
			property = properties[key] = new Property<any>({
				model: this,
				key: key
			});
		}

		return property;
	}

	isValid():boolean {
		var properties = this._getProperties();
		for (var key in properties) {
			if (properties[key].get('errors').length) {
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
		return when(this.get('collection').remove(this.get('collection').getIdentity(this))).then(<T>(returnValue:T):T => {
			this.set('scenario', 'insert');
			return returnValue;
		});
	}

	save(skipValidation?:boolean):IPromise<void> {
		// TODO: Implementation

		return;
	}

	validate(keysToValidate?:string[]):IPromise<boolean> {
		if (this._values.validatorInProgress) {
			this._values.validatorInProgress.cancel('Validation restarted');
			this._values.validatorInProgress = null;
		}

		this.clearErrors();

		var self = this,
			dfd:IDeferred<boolean> = new Deferred<boolean>(),
			properties = this._getProperties(),
			propertiesKeys = util.getObjectKeys(properties),
			i = 0;

		(function validateNextField():void {
			var key = propertiesKeys[i++];

			if (!key) {
				// all fields have been validated
				self._values.validatorInProgress = null;
				dfd.resolve(self.isValid());
			}
			else if (keysToValidate && array.indexOf(keysToValidate, key) === -1) {
				validateNextField();
			}
			else {
				self._values.validatorInProgress = properties[key].validate().then(validateNextField, function (error:Error):void {
					dfd.reject(error);
				});
			}
		})();

		return dfd.promise;
	}
}

Model.prototype.get = function(key:string):any {
	var property:data.IProperty<any> = this._getProperties()[key];
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
	else if (this.has(key)) {
		Observable.prototype.set.call(this, key, value);
	}
};

module Model {
	export interface IProperties {
		[key:string]:data.IProperty<any>;
	}
	export interface IPropertyConstructor<T> {
		new (kwArgs:data.IPropertyArguments<T>):data.IProperty<T>;
	}
	export interface ISchema {
		[key:string]:IPropertyConstructor<any>;
	}
}

Model.defaults({
	isExtensible: false,
	scenario: 'insert'
});

export = Model;
