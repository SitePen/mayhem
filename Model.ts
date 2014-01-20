import core = require('./interfaces');
import has = require('./has');
import array = require('dojo/_base/array');
import when = require('dojo/when');
import Deferred = require('dojo/Deferred');
import util = require('./util');
import Mediator = require('./Mediator');
import ModelProxty = require('./ModelProxty');
import ValidationError = require('./validators/ValidationError');


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

	get(key:string):any {
		return this[key] && this[key].get();
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

	addError(field:string, error:ValidationError):void {
		this[field].addError(error);
	}

	getErrors(field?:string):Error[] /*ValidationError[]*/ {
		if (field) {
			return this[field].getErrors();
		}
		// grab errors from all proxties
		var proxtyMap = this._getProxtyMap(),
			keys:string[] = util.getObjectKeys(proxtyMap),
			errors:Error[] /*ValidationError[]*/ = [];
		array.forEach(util.getObjectKeys(proxtyMap), function(key) {
			var value = proxtyMap[key];
			// FIXME is typescript getting the spread op?
			// errors.push(...value.getErrors());
			Array.prototype.push.apply(errors, value.getErrors());
		});
		return errors;
	}

	clearErrors():void {
		var proxtyMap = this._getProxtyMap();
		// TODO should we have a clearErrors call on ModelProxties?
		array.forEach(util.getObjectKeys(proxtyMap), function(key) {
			proxtyMap[key].clearErrors();
		});
	}

	isValid():boolean {
		return !this.getErrors().length;
	}

	validate(fields?:string[]):IPromise<void> {
		this.clearErrors();

		var self = this,
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
					if (scenarios && length && array.indexOf(scenarios, this.scenario) === -1) {
						return runNextValidator();
					}
				}

				// If a validator returns false, we stop processing any other validators on this field;
				// if there is an error, validation processing halts
				var validationResult = validator.validate(self, key, value);
				when(validationResult).then(function () {
					runNextValidator()
				}, function (error) {
					dfd.reject(error);
				});
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

	// TODO stubs
	remove():void {}
	save(skipValidation?:boolean):IPromise<void> {
		return when(undefined);
	}
}

export = Model;
