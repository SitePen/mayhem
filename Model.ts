import array = require('dojo/_base/array');
import core = require('./interfaces');
import Deferred = require('dojo/Deferred');
import has = require('./has');
import Mediator = require('./Mediator');
import ModelProxty = require('./ModelProxty');
import util = require('./util');
import ValidationError = require('./validation/ValidationError');
import when = require('dojo/when');

// class User extends Model {
// 	username:core.IModelProxty<string> = new ModelProxty<string>({
// 		label: 'Username',
// 		validators: [ {
// 			validate: function (model:core.IModel, key:string, proxty:ModelProxty<string>):IPromise<boolean> {
// 				model.addError(key, new ValidationError('You broke it!', { name: proxty.label }));
// 				return when(false);
// 			}
// 		} ]
// 	});

// 	firstName:core.IModelProxty<string> = new ModelProxty<string>({
// 		default: 'Joe',
// 		validators: []
// 	});

// 	lastName:core.IModelProxty<string> = new ModelProxty<string>({
// 		default: 'Bloggs',
// 		validators: []
// 	});
// }

// class UserMediator extends Mediator {
// 	fullName:core.IModelProxty<string> = new ModelProxty<string>({
// 		get: function () {
// 			return this.get('firstName') + ' ' + this.get('lastName');
// 		},
// 		dependencies: [ 'firstName', 'lastName' ]
// 	});
// }

class Model implements core.IModel {
	app:core.IApplication;
	collection:any /*dstore.Collection*/;
	isExtensible:boolean = false;
	scenario:string = 'insert';

	constructor(kwArgs:Object = {}) {
		this.set(kwArgs);
	}

	addError(key:string, error:ValidationError):void {
		this[key].addError(error);
	}

	clearErrors():void {
		var proxtyMap = this._getProxtyMap();
		// TODO should we have a clearErrors call on ModelProxties?
		array.forEach(util.getObjectKeys(proxtyMap), function(key) {
			proxtyMap[key].clearErrors();
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
			Array.prototype.push.apply(errors, value.getErrors());
		});
		return errors;
	}

	getProxty(key:string):core.IModelProxty<any> {
		if (this[key] && this[key].isProxty) {
			return this[key];
		}

		throw new Error('No proxty for key ' + key);
	}

	private _getProxtyMap():{ [key:string]: core.IModelProxty<any>; } {
		var key:string,
			proxtyMap:{ [key:string]: core.IModelProxty<any>; } = {};
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

	observe(observer:core.IObserver<any>):IHandle;
	observe(key:string, observer:core.IObserver<any>):IHandle;
	observe(key:any, observer?:core.IObserver<any>):IHandle {
		if (!key) {
			// TODO: This probably should be possible too, but need to think of an actual use case before making
			// the implementation more difficult.
			throw new Error('Cannot observe all properties of a model, please use a key');
		}

		if (!this[key]) {
			// TODO: Not correct, putting it here for now for moving forward-sake; we should really figure out how
			// to manage dynamic models.
			throw new Error('Cannot observe undefined key on model');
		}

		return (<core.IProxty<any>> this[key]).observe(observer);
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
			if (proxty.validateOnSet) {
				this.validate([ key ]);
			}
		}
	}

	validate(fields?:string[]):IPromise<boolean> {
		function validateNextField():void {
			function runNextValidator():void {
				var validator = proxty.validators[j++];

				// end of list of validators for this field reached
				if (!validator) {
					return validateNextField();
				}

				var value = proxty.get();

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

			if (!proxty || !proxty.validators) {
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
