/// <reference path="./intern" />

import assert = require('intern/chai!assert');
import core = require('../interfaces');
import array = require('dojo/_base/array');
import Deferred = require('dojo/Deferred');
import when = require('dojo/when');
import util = require('../util');
import Model = require('../Model');
import Mediator = require('../Mediator');
import ModelProxty = require('../ModelProxty');
import registerSuite = require('intern!object');
import RequiredValidator = require('../validation/RequiredValidator');
import ValidationError = require('../validation/ValidationError');

class PopulatedModel extends Model {
	string:core.IModelProxty<string> = new ModelProxty<string>({
		default: 'foo'
	});
	number:core.IModelProxty<number> = new ModelProxty<number>({
		default: 1234
	});
	boolean:core.IModelProxty<boolean> = new ModelProxty<boolean>({
		default: true
	});
	object:core.IModelProxty<{ [key:string]: any; }> = new ModelProxty<{ [key:string]: any; }>({
		default: { foo: 'foo' }
	});
	array:core.IModelProxty<any[]> = new ModelProxty<any[]>({
		default: [ 'foo', 'bar' ]
	});
	any:core.IModelProxty<any> = new ModelProxty<any>({
		default: 'foo'
	});
}

// class PopulatedMediator extends Mediator {
// 	accessor:core.IModelProxty<string> = new ModelProxty<string>({
// 		get: function () {
// 			return this.get('firstName') + ' ' + this.get('lastName');
// 		},
// 		dependencies: [ 'firstName', 'lastName' ]
// 	});
// }


var syncStringIsAValidator = {
	validate: function (model:core.IModel, key:string, value:string):void {
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
	validate: function (model:core.IModel, key:string, value:string):IPromise<void> {
		var dfd:IDeferred<void> = new Deferred<void>();
		setTimeout(function () {
			if (value !== 'B') {
				model.addError(key, new ValidationError(value + ' is not B'));
			}
			dfd.resolve(undefined);
		}, 0);
		return dfd.promise;
	}
};

class TestValidationModel extends Model {
	syncA:core.IModelProxty<string> = new ModelProxty<string>({
		default: 'A',
		validators: [ syncStringIsAValidator ]
	});
	syncB:core.IModelProxty<string> = new ModelProxty<string>({
		default: 'B',
		validators: [ syncStringIsAValidator ]
	});
	asyncA:core.IModelProxty<string> = new ModelProxty<string>({
		default: 'A',
		validators: [ asyncStringIsBValidator ]
	});
	asyncB:core.IModelProxty<string> = new ModelProxty<string>({
		default: 'B',
		validators: [ asyncStringIsBValidator ]
	});
}


class TestRequiredValidationModel extends TestValidationModel {
	required:core.IModelProxty<string> = new ModelProxty<string>({
		validators: [ new RequiredValidator() ]
	})
}


class TestValidationExceptionsModel extends Model {
	sync:core.IModelProxty<string> = new ModelProxty<string>({
		validators: [ {
			validate: function (model:core.IModel, key:string, value:string):IPromise<void> {
				throw new Error('Boom');
			}
		} ]
	})
	async:core.IModelProxty<string> = new ModelProxty<string>({
		validators: [ {
			validate: function (model:core.IModel, key:string, value:string):IPromise<void> {
				var dfd:IDeferred<void> = new Deferred<void>();
				setTimeout(function () {
					dfd.reject(new Error('BOOM'));
				}, 0);
				return dfd.promise;
			}
		} ]
	})
}


var startsWithA = function (model:core.IModel, key:string, value:string):void {
	if (!value || value[0] !== 'A') {
		model.addError(key, new ValidationError(value + ' does not start with A'));
	}
	return undefined;
};

var endsWithB = function (model:core.IModel, key:string, value:string):void {
	if (!value || value[value.length - 1] !== 'B') {
		model.addError(key, new ValidationError(value + ' does not end with B'));
	}
	return undefined;
};

var lengthOf2 = function (model:core.IModel, key:string, value:string):void {
	if (!value || value.length !== 2) {
		model.addError(key, new ValidationError(value + ' should have a length of 2'));
	}
	return undefined;
};

class TestValidationScenarioModel extends Model {
	prop:core.IModelProxty<string> = new ModelProxty<string>({
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
}


// function createPopulatedModel() {

// 	var model = new (declare(Model, {
// 		_schema: {
// 			string: 'string',
// 			number: 'number',
// 			boolean: 'boolean',
// 			object: Object,
// 			array: Array,
// 			any: null,
// 			accessor: 'string'
// 		},

// 		_accessorGetter: function () {
// 			return this._accessor;
// 		},

// 		_accessorSetter: function (value:any) {
// 			this._accessor = value;
// 			return value;
// 		}
// 	}))();

// 	model.set({
// 		string: 'foo',
// 		number: 1234,
// 		'boolean': true,
// 		object: { foo: 'foo' },
// 		array: [ 'foo', 'bar' ],
// 		any: 'foo',
// 		invalid: 'foo',
// 		accessor: 'foo'
// 	});

// 	return model;
// }


registerSuite({
	name: 'Model',

	'#get and #set': function () {
		var model = new PopulatedModel();

		assert.strictEqual(model.get('string'), 'foo', 'string schema properties should be mutable as strings from an object');
		assert.strictEqual(model.get('number'), 1234, 'number schema properties should be mutable as numbers from an object');
		assert.strictEqual(model.get('boolean'), true, 'boolean schema properties should be mutable as booleans from an object');
		assert.deepEqual(model.get('object'), { foo: 'foo' }, 'Object schema properties should be mutable as objects from an object');
		assert.deepEqual(model.get('array'), [ 'foo', 'bar' ], 'Array schema properties should be mutable as arrays from an object');
		assert.strictEqual(model.get('any'), 'foo', 'null schema properties should be mutable as any value from an object');
		assert.strictEqual(model.get('invalid'), undefined, 'non-existant schema properties should not be mutable from an object');
		//assert.strictEqual(model.get('accessor'), 'foo', 'accessors and mutators should work normally');

		// model.set('number', 'not-a-number');
		// assert.typeOf(model.get('number'), 'number', 'number schema properties should still be numbers even if passed a non-number value');
		// assert.isTrue(isNaN(model.get('number')), 'number schema properties should still be set even if passed a non-number value');

		// model.set('string', 1234);
		// assert.typeOf(model.get('string'), 'string', 'string schema properties should still be strings even if passed a non-string value');
		// assert.strictEqual(model.get('string'), '1234', 'string schema properties should still be set even if passed a non-string value');

		// model.set('boolean', 'foo');
		// assert.typeOf(model.get('boolean'), 'boolean', 'boolean schema properties should still be booleans even if passed a non-boolean value');
		// assert.strictEqual(model.get('boolean'), true, 'boolean schema properties should still be set even if passed a non-boolean value');

		// model.set('boolean', 'false');
		// assert.strictEqual(model.get('boolean'), false, 'setting "false" string to boolean property should set it to false');

		// model.set('boolean', '0');
		// assert.strictEqual(model.get('boolean'), false, 'setting "0" string to boolean property should set it to false');

		// model.set('boolean', []);
		// assert.strictEqual(model.get('boolean'), false, 'setting an empty array to boolean property should set it to false');

		// model.set('object', 'foo');
		// assert.instanceOf(model.get('object'), Object, 'Object schema properties should still be Objects even if passed a non-Object value');
		// assert.deepEqual(model.get('object'), { 0: 'f', 1: 'o', 2: 'o' }, 'Object schema properties should still be set even if passed a non-Object value');

		// model.set('array', 'foo');
		// assert.instanceOf(model.get('array'), Array, 'Array schema properties should still be Arrays even if passed a non-Array value');
		// assert.deepEqual(model.get('array'), [ 'foo' ], 'Array schema properties should still be set even if passed a non-Array value');

		// model.set('any', 1234);
		// assert.typeOf(model.get('any'), 'number', 'any-type schema properties should be the type of the value passed');
		// assert.strictEqual(model.get('any'), 1234, 'any-type schema properties should be set regardless of the type of value');

		// model.set('invalid', 'foo');
		// assert.strictEqual(model.get('invalid'), undefined, 'non-existant schema properties should not be mutable');
	},

	// '#revert': function () {
	// 	var model = createPopulatedModel();

	// 	model.revert();

	// 	assert.strictEqual(model.get('string'), undefined, 'Reverted data should be unset when values are uncommitted');
	// 	assert.strictEqual(model.get('number'), undefined, 'Reverted data should be unset when values are uncommitted');
	// },

	// '#commit': function () {
	// 	var model = createPopulatedModel();

	// 	model.commit();
	// 	model.revert();

	// 	assert.strictEqual(model.get('string'), 'foo', 'Reverted data should not be unset once values are committed');
	// 	assert.strictEqual(model.get('number'), 1234, 'Reverted data should not be unset once values are committed');
	// },

	'#save async': function () {
		var model = new Model();

		// If there is an exception in the basic save logic, it will be used to fail the test
		return model.save();
	},

	'#validate': function () {
		var model = new TestValidationModel();

		return model.validate().then(function () {
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

	'#validate specific fields': function () {
		var model = new TestValidationModel();

		return model.validate([ 'syncA', 'asyncB' ]).then(function () {
			assert.isTrue(model.isValid(), 'Validating only known-valid fields should validate to true');
			assert.strictEqual(model.getErrors().length, 0, 'Model should have no errors');

			var errors = model.getErrors('syncA');
			assert.strictEqual(errors.length, 0, 'Valid model field should have zero errors');

			errors = model.getErrors('asyncB');
			assert.strictEqual(errors.length, 0, 'Valid model field should have zero errors');
		});
	},

	'#validate required fields': function () {
		var model = new TestRequiredValidationModel();

		// Set inherited model fields to be valid
		model.set('syncB', 'A');
		model.set('asyncA', 'B');
		return model.validate().then(function () {
			assert.isFalse(model.isValid(), 'Invalid model should validate to false');
			var errors = model.getErrors();
			assert.strictEqual(errors.length, 1, 'Model should have exactly 1 error');
			assert.match(errors[0].toString(), /field required/, 'The error message should include the reason');

			model.set('required', 'foo');
			return model.validate().then(function () {
				assert.isTrue(model.isValid(), 'Required field set so should validate to true');
				assert.strictEqual(model.getErrors().length, 0, 'Model should have no errors');
			});
		});
	},

	'#validate with allowEmpty': function () {
		var model = new TestValidationModel();

		// Set inherited model fields to be valid
		model.set('syncA', '');
		model.set('syncB', '');
		model.set('asyncA', '');
		model.set('asyncB', '');
		return model.validate().then(function () {
			assert.isFalse(model.isValid(), 'Invalid model should validate to false');
			var errors = model.getErrors();
			assert.strictEqual(errors.length, 2, 'Model should have exactly 2 errors');

			assert.strictEqual(model.getErrors('syncA').length, 0, 'Valid model field should have zero errors');
			assert.strictEqual(model.getErrors('syncB').length, 0, 'Valid model field should have zero errors');
			assert.strictEqual(model.getErrors('asyncA').length, 1, 'Invalid model field should have 1 error');
			assert.strictEqual(model.getErrors('asyncB').length, 1, 'Invalid model field should have 1 error');
		});
	},

	'#validate throws synchronously': function () {
		var model = new TestValidationExceptionsModel();

		return model.validate([ 'sync' ]).then(function () {
			assert(false, 'Validation should not succeed');
		}, function(error) {
			assert.match(error.message, /boom/i, 'Validator for field should throw');
		});
	},

	'#validate throws asynchronously': function () {
		var model = new TestValidationExceptionsModel();

		return model.validate([ 'async' ]).then(function () {
			assert(false, 'Validation should not succeed');
		}, function(error) {
			assert.match(error.message, /boom/i, 'Validator for field should throw');
		});
	},

	'#validate using scenarios': function () {
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
			model.scenario = scenario;
			model.set('prop', value);
			return model.validate().then(function ():IPromise<void> {
				var message = 'Model with ' + scenario + ' scenario should have ' + count + ' errors for ' + value;
				assert.strictEqual(model.getErrors().length, count, message);
				return undefined;
			});
		}
		var lastPromise:IPromise<void>;

		array.forEach(util.getObjectKeys(scenarios), function (scenario:string) {
			var counts = scenarios[scenario];
			array.forEach(util.getObjectKeys(counts), function (value:string) {
				lastPromise = when(lastPromise, function () {
					return revalidate(scenario, value, counts[value]);
				});
			});
		});

		return lastPromise;
	},

	// '#isFieldRequired': function () {
	// 	var RequiredValidatorSubclass = declare(RequiredValidator, {});

	// 	var model = new (declare(Model, {
	// 		_validators: {
	// 			requiredField1: [ new RequiredValidator() ],
	// 			requiredField2: [ new RequiredValidatorSubclass() ],
	// 			optionalField: [ ]
	// 		}
	// 	}))();

	// 	assert.isTrue(model.isFieldRequired('requiredField1'), 'Field should be required');
	// 	assert.isTrue(model.isFieldRequired('requiredField2'), 'Field should be required');
	// 	assert.isFalse(model.isFieldRequired('optionalField'), 'Field should not be required');
	// }
});