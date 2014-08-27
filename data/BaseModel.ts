import array = require('dojo/_base/array');
import core = require('../interfaces');
import data = require('./interfaces');
import Deferred = require('dojo/Deferred');
import lang = require('dojo/_base/lang');
import Observable = require('../Observable');
import Property = require('./Property');
import util = require('../util');

class BaseModel extends Observable implements data.IBaseModel, core.IHasMetadata {
	static property<T>(propertyKwArgs:data.IPropertyArguments<T>):any {
		return (kwArgs:data.IPropertyArguments<T>):Property<T> => {
			return new Property<T>(lang.mixin({}, propertyKwArgs, kwArgs));
		};
	}

	static schema(schema:BaseModel.ISchema):void;
	static schema(schemaCreator:(parentSchema?:BaseModel.ISchema) => BaseModel.ISchema):void
	static schema(schema:any):void {
		var proto = this.prototype;

		if (typeof schema === 'function') {
			proto._schema = schema(proto._schema);
		}
		else {
			proto._schema = schema;
		}
	}

	_schema:BaseModel.ISchema;
	_app:core.IApplication;
	_isExtensible:boolean;
	_validatorInProgress:IPromise<void>;

	call:data.IBaseModelCall;
	get:data.IBaseModelGet;
	set:data.IBaseModelSet;

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
		var properties:BaseModel.IProperties = this._getProperties();
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

	/* protected */ _getProperties():BaseModel.IProperties {
		var properties:any = {};
		for (var key in this._schema) {
			var PropertyCtor:BaseModel.IPropertyConstructor<any> = this._schema[key];
			properties[key] = new PropertyCtor({
				key: key,
				model: this
			});
		}

		this._getProperties = ():BaseModel.IProperties => {
			return properties;
		};

		var connectDependency = (property:any, sourceName:string, destinationName:string):void => {
			this.observe(sourceName, ():void => {
				property._notify('value', property.get('value'), undefined);
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
		var properties:BaseModel.IProperties = this._getProperties(),
			property:data.IProperty<any> = properties[key];

		if (!property && !(('_' + key) in this) && this.get('isExtensible')) {
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
		return property
			? property.observe('value', (newValue:any, oldValue:any):void => observer(newValue, oldValue, key))
			: super.observe(key, observer);
	}

	_restore(Ctor:new (...args:any[]) => BaseModel):BaseModel {
		return new Ctor(this);
	}

	validate(keysToValidate?:string[]):IPromise<boolean> {
		if (this._validatorInProgress) {
			this._validatorInProgress.cancel('Validation restarted');
			this._validatorInProgress = null;
		}

		this.clearErrors();

		var self = this,
			dfd = new Deferred<boolean>(),
			properties = this._getProperties(),
			propertiesKeys = util.getObjectKeys(properties),
			i = 0;

		(function validateNextField():void {
			var key = propertiesKeys[i++];

			if (!key) {
				// all fields have been validated
				self._validatorInProgress = null;
				dfd.resolve(self.isValid());
			}
			else if (keysToValidate && array.indexOf(keysToValidate, key) === -1) {
				validateNextField();
			}
			else {
				self._validatorInProgress = properties[key].validate().then(validateNextField, function (error:Error):void {
					dfd.reject(error);
				});
			}
		})();

		return dfd.promise;
	}
}

lang.mixin(BaseModel.prototype, {
	call(method:string, ...args:any[]):any {
		if (this[method]) {
			return this[method].apply(this, args);
		}
	},
	get(key:string):any {
		var property:data.IProperty<any> = this._getProperties()[key];
		return property ? property.get('value') : Observable.prototype.get.call(this, key);
	},
	set(key:any, value?:any):void {
		if (util.isObject(key)) {
			var kwArgs:{ [key:string]: any; } = key;
			for (key in kwArgs) {
				if (key === 'constructor') {
					continue;
				}
				this.set(key, kwArgs[key]);
			}

			return;
		}

		var property:data.IProperty<any> = this._getProperty(key);
		if (property) {
			property.set('value', value);
		}
		else {
			Observable.prototype.set.call(this, key, value);
		}
	}
});

module BaseModel {
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

BaseModel.prototype._isExtensible = false;

export = BaseModel;
