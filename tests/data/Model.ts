/// <reference path="../../dojo"/>
/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import core = require('../../interfaces');
import data = require('../../data/interfaces');
import array = require('dojo/_base/array');
import Deferred = require('dojo/Deferred');
import lang = require('dojo/_base/lang');
import when = require('dojo/when');
import util = require('../../util');
import Model = require('../../data/Model');
import Mediator = require('../../data/Mediator');
import registerSuite = require('intern!object');
import RequiredValidator = require('../../validation/RequiredValidator');
import ValidationError = require('../../validation/ValidationError');

class PopulatedModel extends Model {}
PopulatedModel.schema(():any => {
	return {
		string: Model.property<string>({
			value: 'foo'
		}),
		number: Model.property<number>({
			value: 1234
		}),
		boolean: Model.property<boolean>({
			value: true
		}),
		object: Model.property<{ [key:string]: any; }>({
			value: { foo: 'foo' }
		}),
		array: Model.property<any[]>({
			value: [ 'foo', 'bar' ]
		}),
		any: Model.property<any>({
			value: 'foo'
		}),

		accessor: Model.property<string>({
			get: function ():string {
				var model = this.get('model');
				return model.get('string') + ' ' + model.get('number');
			},
			set: function (value:string):void {
				var names:string[] = value.split(' '),
					model = this.get('model');
				model.set({
					string: names[0]
				});
			}
		})
	};
});

var syncStringIsAValidator = {
	validate: function (model:data.IModel, key:string, value:string):void {
		if (value !== 'A') {
			model.addError(key, new ValidationError(value + ' is not A'));
		}
		return undefined;
	},
	options: {
		allowEmpty: true
	}
};

var asyncStringIsBValidator = {
	validate: function (model:data.IModel, key:string, value:string):IPromise<void> {
		var dfd:IDeferred<void> = new Deferred<void>();
		setTimeout(function ():void {
			if (value !== 'B') {
				model.addError(key, new ValidationError(value + ' is not B'));
			}
			dfd.resolve(undefined);
		}, 0);
		return dfd.promise;
	}
};

class TestValidationModel extends Model {}
TestValidationModel.schema(():any => {
	return {
		syncA: Model.property<string>({
			value: 'A',
			validators: [ syncStringIsAValidator ]
		}),
		syncB: Model.property<string>({
			value: 'B',
			validators: [ syncStringIsAValidator ]
		}),
		asyncA: Model.property<string>({
			value: 'A',
			validators: [ asyncStringIsBValidator ]
		}),
		asyncB: Model.property<string>({
			value: 'B',
			validators: [ asyncStringIsBValidator ]
		})
	};
});

class TestRequiredValidationModel extends TestValidationModel {}
TestRequiredValidationModel.schema((parentSchema:any):any => {
	return lang.delegate(parentSchema, {
		required: Model.property<string>({
			validators: [ new RequiredValidator() ]
		})
	});
});

class TestValidationExceptionsModel extends Model {}
TestValidationExceptionsModel.schema(():any => {
	return {
		sync: Model.property<string>({
			validators: [ {
				validate: function (model:data.IModel, key:string, value:string):IPromise<void> {
					throw new Error('Boom');
				}
			} ]
		}),
		async: Model.property<string>({
			validators: [ {
				validate: function (model:data.IModel, key:string, value:string):IPromise<void> {
					var dfd:IDeferred<void> = new Deferred<void>();
					setTimeout(function ():void {
						dfd.reject(new Error('BOOM'));
					}, 0);
					return dfd.promise;
				}
			} ]
		})
	};
});

var startsWithA = function (model:data.IModel, key:string, value:string):void {
	if (!value || value[0] !== 'A') {
		model.addError(key, new ValidationError(value + ' does not start with A'));
	}
	return undefined;
};

var endsWithB = function (model:data.IModel, key:string, value:string):void {
	if (!value || value[value.length - 1] !== 'B') {
		model.addError(key, new ValidationError(value + ' does not end with B'));
	}
	return undefined;
};

var lengthOf2 = function (model:data.IModel, key:string, value:string):void {
	if (!value || value.length !== 2) {
		model.addError(key, new ValidationError(value + ' should have a length of 2'));
	}
	return undefined;
};

class TestValidationScenarioModel extends Model {}
TestValidationScenarioModel.schema(():any => {
	return {
		prop: Model.property<string>({
			validators: [ {
				validate: lengthOf2
			}, {
				validate: startsWithA,
				options: {
					scenarios: [ 'insert' ]
				}
			}, {
				validate: endsWithB,
				options: {
					scenarios: [ 'insert', 'remove' ]
				}
			} ]
		})
	};
});

registerSuite({
	name: 'Model',

	'#get and #set': function ():void {
		var model = new PopulatedModel();

		assert.strictEqual(model.get('string'), 'foo', 'string schema properties should be mutable as strings from an object');
		assert.strictEqual(model.get('number'), 1234, 'number schema properties should be mutable as numbers from an object');
		assert.strictEqual(model.get('boolean'), true, 'boolean schema properties should be mutable as booleans from an object');
		assert.deepEqual(model.get('object'), { foo: 'foo' }, 'Object schema properties should be mutable as objects from an object');
		assert.deepEqual(model.get('array'), [ 'foo', 'bar' ], 'Array schema properties should be mutable as arrays from an object');
		assert.strictEqual(model.get('any'), 'foo', 'null schema properties should be mutable as any value from an object');
		assert.strictEqual(model.get('invalid'), undefined, 'non-existant schema properties should not be mutable from an object');
		assert.strictEqual(model.get('accessor'), 'foo 1234');

		model.set({
			constructor: 1,
			newValue: 2
		});
		
		assert.notEqual(model.get('constuctor'), 1);
		assert.equal(model.get('newValue'), 2);
	},

	'#getMetadata': function ():void {
		var model = new PopulatedModel();
		var meta:data.IProperty<any> = model.getMetadata('number');
		assert.equal(meta.get('value'), 1234);
	},

	'#destroy': function ():void {
		var model = new PopulatedModel();
		model.destroy();
		assert.throws(function ():void {
			model.get('number');
		}, 'object is not a function');
	},

	'#save async': function ():IPromise<void> {
		var model = new Model();

		// If there is an exception in the basic save logic, it will be used to fail the test
		return model.save();
	},

	'#validate': function ():IPromise<void> {
		var model = new TestValidationModel();

		return model.validate().then(function ():void {
			assert.isFalse(model.isValid(), 'Invalid model `isValid` check should return false');
			assert.strictEqual(model.getErrors().length, 2, 'Model should have exactly 2 errors');

			errors = model.getErrors('syncA');
			assert.strictEqual(errors.length, 0, 'Valid model field should have zero errors');

			var errors = model.getErrors('syncB');
			assert.strictEqual(errors.length, 1, 'Invalid model field should have only one error');
			assert.strictEqual(errors[0].message, 'B is not A', 'Invalid model error should be set properly from validator');

			errors = model.getErrors('asyncA');
			assert.strictEqual(errors.length, 1, 'Invalid model field should have only one error');
			assert.strictEqual(errors[0].message, 'A is not B', 'Invalid model error should be set properly from validator');

			errors = model.getErrors('asyncB');
			assert.strictEqual(errors.length, 0, 'Valid model field should have zero errors');
		});
	},

	'#validate specific fields': function ():IPromise<void> {
		var model = new TestValidationModel();

		return model.validate([ 'syncA', 'asyncB' ]).then(function ():void {
			assert.isTrue(model.isValid(), 'Validating only known-valid fields should validate to true');
			assert.strictEqual(model.getErrors().length, 0, 'Model should have no errors');

			var errors = model.getErrors('syncA');
			assert.strictEqual(errors.length, 0, 'Valid model field should have zero errors');

			errors = model.getErrors('asyncB');
			assert.strictEqual(errors.length, 0, 'Valid model field should have zero errors');
		});
	},

	'#validate required fields': function ():IPromise<void> {
		var model = new TestRequiredValidationModel();

		// Set inherited model fields to be valid
		model.set('syncB', 'A');
		model.set('asyncA', 'B');
		return model.validate().then(function ():IPromise<void> {
			assert.isFalse(model.isValid(), 'Invalid model should validate to false');
			var errors = model.getErrors();
			assert.strictEqual(errors.length, 1, 'Model should have exactly 1 error');
			assert.match(errors[0].toString(), /field required/, 'The error message should include the reason');

			model.set('required', 'foo');
			return model.validate().then(function ():void {
				assert.isTrue(model.isValid(), 'Required field set so should validate to true');
				assert.strictEqual(model.getErrors().length, 0, 'Model should have no errors');
			});
		});
	},

	'#validate with allowEmpty': function () {
		var model = new TestValidationModel(),
			dfd = this.async(1000);

		model.validate().then(dfd.callback(function ():void {
			assert.isFalse(model.isValid(), 'Invalid model should validate to false');
			var errors = model.getErrors();
			assert.strictEqual(errors.length, 2, 'Model should have exactly 2 errors');

			assert.strictEqual(model.getErrors('syncA').length, 0, 'Valid model field should have zero errors');
			assert.strictEqual(model.getErrors('syncB').length, 1, 'Valid model field should have zero errors');
			assert.strictEqual(model.getErrors('asyncA').length, 1, 'Invalid model field should have 1 error');
			assert.strictEqual(model.getErrors('asyncB').length, 0, 'Invalid model field should have 1 error');
		}));
	},

	'#validate throws synchronously': function () {
		var model = new TestValidationExceptionsModel();

		assert.throws(function () {
			model.validate([ 'sync' ]);
		});
	},

	'#validate throws asynchronously': function ():IPromise<void> {
		var model = new TestValidationExceptionsModel();

		return model.validate([ 'async' ]).then(function ():void {
			assert(false, 'Validation should not succeed');
		}, function(error:Error):void {
			assert.match(error.message, /boom/i, 'Validator for field should throw');
		});
	},

	'#validate using scenarios': function ():IPromise<void> {
		var scenarios = {
			insert: { // lengthOf2, startsWithA, endsWithB
				ABC: 2,
				ABB: 1,
				BBA: 3,
				AAA: 2,
				BBB: 2,
				AB: 0,
				AA: 1,
				BB: 1,
				BA: 2,
				CC: 2,
				A: 2,
				B: 2,
				C: 3,
				'': 3
			},
			remove: { // lengthOf2, endsWithB
				ABC: 2,
				ABB: 1,
				BBA: 2,
				AAA: 2,
				BBB: 1,
				AB: 0,
				AA: 1,
				BB: 0,
				BA: 1,
				CC: 1,
				A: 2,
				B: 1,
				C: 2,
				'': 2
			},
			unknown: { // lengthOf2
				ABC: 1,
				ABB: 1,
				BBA: 1,
				AAA: 1,
				BBB: 1,
				AB: 0,
				AA: 0,
				BB: 0,
				BA: 0,
				CC: 0,
				A: 1,
				B: 1,
				C: 1,
				'': 1
			}
		};
		var model = new TestValidationScenarioModel();

		function revalidate(scenario:string, value:string, count:number):IPromise<void> {
			model.set({
				scenario: scenario,
				prop: value
			});
			return model.validate().then(function ():IPromise<void> {
				var message = 'Model with ' + scenario + ' scenario should have ' + count + ' errors for ' + value;
				assert.strictEqual(model.getErrors().length, count, message);
				return undefined;
			});
		}
		var lastPromise:IPromise<void>;

		array.forEach(util.getObjectKeys(scenarios), function (scenario:string):void {
			var counts = scenarios[scenario];
			array.forEach(util.getObjectKeys(counts), function (value:string):void {
				lastPromise = when(lastPromise, function ():IPromise<void> {
					return revalidate(scenario, value, counts[value]);
				});
			});
		});

		return lastPromise;
	}
});
