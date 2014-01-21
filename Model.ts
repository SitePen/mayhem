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

class Model /*implements core.IModel*/ {
	collection:any /*dstore.Collection*/;
	isExtensible:boolean = true;
	scenario:string = 'insert';

	constructor(initialProperties:{ [key:string]:core.IModelProxty<any>; }) {
		for (var k in initialProperties) {
			this[k] = initialProperties[k];
		}
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

	set(key:string, value:any):void {
		if (!(key in this)) {
			if (this.isExtensible) {
				this[key] = new ModelProxty<typeof value>({});
			}
			else if (has('debug')) {
				console.warn('Not setting undefined property "' + key + '" on model');
				return;
			}
		}

		this[key].set(value);
	}

	validate(fields?:string[]):IPromise<void> {

		this.clearErrors();

		var model = this,
			dfd:IDeferred<void> = new Deferred<void>(),
			proxtyMap = this._getProxtyMap(),
			keys = util.getObjectKeys(proxtyMap),
			i = 0;

		validateNextField();
		return dfd.promise;


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
				dfd.resolve(undefined);
			}
			else if (fields && array.indexOf(fields, key) === -1) {
				validateNextField();
			}
			else {
				runNextValidator();
			}
		}
	}
}

export = Model;
