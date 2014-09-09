import array = require('dojo/_base/array');
import core = require('../interfaces');
import data = require('./interfaces');
import lang = require('dojo/_base/lang');
import Observable = require('../Observable');
import Promise = require('../Promise');
import Property = require('./Property');
import util = require('../util');
import ValidationError = require('../validation/ValidationError');

class Model extends Observable implements data.IModel {
	/**
	 * @protected
	 */
	static _app:any;

	static property<T>(staticArgs:data.IProperty.KwArgs<T>):any {
		return function (kwArgs:data.IProperty.KwArgs<T>):Property<T> {
			return new Property<T>(lang.mixin({}, staticArgs, kwArgs));
		};
	}

	static schema(schema:HashMap<Model.IPropertyConstructor>):void;
	static schema(schemaCreator:(parentSchema?:HashMap<Model.IPropertyConstructor>) => HashMap<Model.IPropertyConstructor>):void;
	static schema(schema:any):void {
		var prototype = this.prototype;

		if (typeof schema === 'function') {
			prototype._schema = schema(prototype._schema);
		}
		else {
			prototype._schema = schema;
		}
	}

	// Because `app` can be something other than an actual Application object, it is set on the constructor and then
	// resolved at construction time
	static setDefaultApp(app:any):void {
		this._app = app;
	}

	/**
	 * @protected
	 */
	_app:core.IApplication;

	/**
	 * @protected
	 */
	_schema:HashMap<Model.IPropertyConstructor>;

	/**
	 * @protected
	 */
	_isExtensible:boolean;

	private _validatorInProgress:IPromise<boolean>;

	call:Model.Callers;
	get:Model.Getters;
	set:Model.Setters;

	constructor(kwArgs?:any) {
		// TODO: This happens somewhere else too I think
		// `app` needs to be set early since it is used when constructing the Property objects inside the model
		if (kwArgs && kwArgs['app'] !== undefined) {
			this._app = kwArgs['app'];
		}
		else {
			var app:any = (<typeof Model> this.constructor)._app;
			var type:string = typeof app;
			if (type === 'object') {
				this._app = app;
			}
			else if (type === 'string') {
				this._app = <any> require(app);
			}
			else if (type === 'function') {
				this._app = app(this);
			}
		}

		super(kwArgs);
	}

	addError(key:string, error:ValidationError):void {
		var property = this._getProperty(key);
		property.addError(error);
	}

	clearErrors(key?:string):void {
		var properties = this._getProperties();

		if (key) {
			properties[key] && properties[key].clearErrors();
			return;
		}

		for (key in properties) {
			properties[key].clearErrors();
		}
	}

	destroy():void {
		this._getProperties = null;
		super.destroy();
	}

	// TODO: Something else? Descriptor
	getMetadata(key:string):data.IProperty<any> {
		// uses _getProperties to avoid automatic generation of descriptors for properties that do not exist,
		// for some reason. TODO: Figure out that reason!
		return this._getProperties()[key];
	}

	/* protected */ _getProperties():HashMap<data.IProperty<any>> {
		var properties:any = {};

		this._getProperties = function ():HashMap<data.IProperty<any>> {
			return properties;
		};

		for (var key in this._schema) {
			var PropertyCtor:Model.IPropertyConstructor = this._schema[key];
			properties[key] = new PropertyCtor({
				app: this._app,
				key: key,
				model: this
			});
		}

		for (key in properties) {
			properties[key].startup();
		}

		return properties;
	}

	// TODO: The way in which this method is used is very weird, there are lots of places where _getProperties is used
	// directly (presumably) in order to avoid the implied property creation semantics. This indicates an issue with
	// this API.
	private _getProperty(key:string):data.IProperty<any> {
		var properties:HashMap<data.IProperty<any>> = this._getProperties();
		var property:data.IProperty<any> = properties[key];

		if (!property && !(('_' + key) in this) && this._isExtensible) {
			property = properties[key] = new Property<any>({
				app: this._app,
				model: this,
				key: key
			});
			property.startup();
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
		return property ?
			property.observe('value', function (newValue:any, oldValue:any):void {
				observer(newValue, oldValue, key);
			}) : super.observe(key, observer);
	}

	// TODO: dstore interface?
	_restore(Ctor:new (...args:any[]) => Model):Model {
		return new Ctor(this);
	}

	validate(keysToValidate?:string[]):IPromise<boolean> {
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
			var properties = self._getProperties();
			var propertiesKeys = util.getObjectKeys(properties);
			var i = 0;
			var currentValidator:Promise<void>;

			setCanceler(function (reason:Error):void {
				currentValidator && currentValidator.cancel(reason);
				i = Infinity;
				throw reason;
			});

			(function validateNextField():void {
				var key = propertiesKeys[i++];

				if (!key) {
					// all fields have been validated
					self._validatorInProgress = currentValidator = null;
					resolve(self.isValid());
				}
				else if (keysToValidate && array.indexOf(keysToValidate, key) === -1) {
					validateNextField();
				}
				else {
					currentValidator = properties[key].validate().then(validateNextField, reject);
				}
			})();
		});

		return promise;
	}
}

Model.prototype.call = function (method:string, ...args:any[]):any {
	return this[method] && this[method].apply(this, args);
};

Model.prototype.get = function (key:string):any {
	// use _getProperties to avoid auto-generation of property objects for undefined or non-Property properties
	var property:data.IProperty<any> = this._getProperties()[key];
	return property ? property.get('value') : Observable.prototype.get.call(this, key);
};

Model.prototype.set = function (key:any, value?:any):void {
	if (util.isObject(key)) {
		Observable.prototype.set.apply(this, arguments);
		return;
	}

	var property:data.IProperty<any> = this._getProperty(key);
	if (property) {
		property.set('value', value);
	}
	else {
		Observable.prototype.set.call(this, key, value);
	}
};

module Model {
	export interface Callers extends data.IModel.Callers {}
	export interface Getters extends Observable.Getters, data.IModel.Getters {}
	export interface Setters extends Observable.Setters, data.IModel.Setters {}

	export interface IPropertyConstructor {
		new (kwArgs:data.IProperty.KwArgs<any>):data.IProperty<any>;
	}
}

// `app` must always be assignable directly to the model since it is used internally and is a reserved name
Model.prototype._app = null;
Model.prototype._isExtensible = false;

export = Model;
