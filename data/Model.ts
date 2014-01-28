import array = require('dojo/_base/array');
import core = require('../interfaces');
import data = require('./interfaces');
import Deferred = require('dojo/Deferred');
import has = require('../has');
import ModelProxty = require('./Property');
import util = require('../util');
import ValidationError = require('../validation/ValidationError');
import when = require('dojo/when');

// TODO: The clarity:
// Model schema is implemented in _schema; this could be implemented another way later, but this is the way we are
// implementing it.
// Each property in the _schema is a property object that contains the metadata for the property
// The value itself is stored on the Model, at property.model[property.key]
// Mediators are just observables, so creating mutable properties for them is very easy

class Model implements data.IModel {
	static property<T>(kwArgs:Object):ModelProxty<T> {
		return new ModelProxty<T>(kwArgs);
	}

	app:core.IApplication;
	collection:any /*dstore.Collection*/;
	isExtensible:boolean = false;
	scenario:string = 'insert';
	/* protected */ _schema:{ [key:string]: any /* TODO: Compiler claims this is incompatible. core.IModelProxty<any> */ };

	constructor(kwArgs:Object = {}) {
		this.app = null;

		for (var key in this._schema) {
			var property:data.IProperty<any> = this._schema[key];
			property.set({
				key: key,
				model: this
			});
			this[key] = this[key].get('default');
		}

		this.set(kwArgs);
	}

	addError(key:string, error:ValidationError):void {
		this._schema[key].addError(error);
	}

	clearErrors():void {
		var proxtyMap = this._getProxtyMap();
		// TODO should we have a clearErrors call on ModelProxties?
		array.forEach(util.getObjectKeys(proxtyMap), function(key) {
			proxtyMap[key].get('errors').splice(0, Infinity);
		});
	}

	get(key:string):any {
		return this[key] && this[key].get();
	}

	getErrors(key?:string):ValidationError[] {
		if (key) {
			return this[key].getErrors();
		}

		// grab errors from all proxties
		var proxtyMap = this._getProxtyMap(),
			keys:string[] = util.getObjectKeys(proxtyMap),
			errors:ValidationError[] = [];

		array.forEach(util.getObjectKeys(proxtyMap), function (key:string) {
			var value = proxtyMap[key];
			// TODO: is typescript getting the spread op?
			// errors.push(...value.getErrors());
			Array.prototype.push.apply(errors, value.get('errors'));
		});
		return errors;
	}

	getMetadata(key:string):data.IProperty<any> {
		return this._schema[key];
	}

	private _getProxtyMap():{ [key:string]: data.IProperty<any>; } {
		var key:string,
			proxtyMap:{ [key:string]: data.IProperty<any>; } = {};
		for (key in this) {
			if (this[key] instanceof ModelProxty) {
				proxtyMap[key] = this[key];
			}
		}
		return proxtyMap;
	}

	isValid():boolean {
		return this.getErrors().length === 0;
	}

	observe(key:string, observer:core.IObserver<any>):IHandle {
		if (!this[key]) {
			// TODO: Not correct, putting it here for now for moving forward-sake; we should really figure out how
			// to manage dynamic models.
			throw new Error('Cannot observe undefined key on model');
		}

		return (<core.IProxty<any>> this[key]).observe(observer);
	}

	remove():void {}
	save(skipValidation?:boolean):IPromise<void> {
		return;
	}

	set(kwArgs:Object):void;
	set(key:string, value:any):void;
	set(key:string, value?:any):void {
		if (typeof key === 'object') {
			var kwArgs:Object = key;
			for (key in kwArgs) {
				this.set(key, kwArgs[key]);
			}
		}
		else {
			if (!(key in this)) {
				if (this.isExtensible) {
					this[key] = new ModelProxty<typeof value>({});
				}
				else if (has('debug')) {
					console.warn('Not setting undefined property "' + key + '" on model');
					return;
				}
			}

			var proxty:ModelProxty<any> = this[key];
			proxty.set(value);

			// TODO: Make this better, validation into the proxty
			if (proxty.get('validateOnSet')) {
				this.validate([ key ]);
			}
		}
	}

	validate(fields?:string[]):IPromise<boolean> {
		function validateNextField():void {
			function runNextValidator():void {
				var validator = proxty.get('validators')[j++];

				// end of list of validators for this field reached
				if (!validator) {
					return validateNextField();
				}

				var value = this.get(key);

				if (validator.options) {
					// Simply skip validators that are defined as allowing empty fields when the value is
					// empty (null, undefined, or empty string)
					if (validator.options.allowEmpty && (value == null || value.toString() === '')) {
						return runNextValidator();
					}

					// Skip validators that are limited to certain scenarios and do not match the currently
					// defined model scenario
					var scenarios:string[] = validator.options.scenarios;
					if (scenarios && scenarios.length && array.indexOf(scenarios, model.scenario) === -1) {
						return runNextValidator();
					}
				}

				// if there is an error, validation processing halts
				try {
					when(validator.validate(model, key, value)).then(function () {
						runNextValidator();
					}, function (error) {
						dfd.reject(error);
					});
				}
				catch (error) {
					dfd.reject(error);
				}
			}

			var key = keys[i++],
                proxty = proxtyMap[key],
                j = 0;

			if (!proxty || !proxty.get('validators').length) {
				dfd.resolve(model.isValid());
			}
			else if (fields && array.indexOf(fields, key) === -1) {
				validateNextField();
			}
			else {
				runNextValidator();
			}
		}

		// TODO: This ruins things when a validation is already in progress
		this.clearErrors();

		var model = this,
			dfd:IDeferred<boolean> = new Deferred<boolean>(),
			proxtyMap = this._getProxtyMap(),
			keys = util.getObjectKeys(proxtyMap),
			i = 0;

		validateNextField();
		return dfd.promise;
	}
}

export = Model;
