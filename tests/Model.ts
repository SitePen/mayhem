/// <reference path="intern.d.ts" />

import core = require('../interfaces');
import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import Deferred = require('dojo/Deferred');
import Model = require('../Model');
import Mediator = require('../Mediator');
import ModelProxty = require('../ModelProxty');
import ValidationError = require('../validators/ValidationError');
import RequiredValidator = require('../validators/RequiredValidator');


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

var syncStringIsBValidator = {
	validate: function (model:core.IModel, key:string, value:string):void {
		if (value !== 'B') {
			model.addError(key, new ValidationError(value + ' is not B'));
		}
		return undefined;
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
		validators: [ syncStringIsBValidator ]
	});
	syncB:core.IModelProxty<string> = new ModelProxty<string>({
		default: 'B',
		validators: [ syncStringIsBValidator ]
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
			assert.isFalse(model.isValid(), 'Invalid model should validate to false');
			assert.strictEqual(model.getErrors().length, 2, 'Model should have exactly 2 errors');

			var errors = model.getErrors('syncA');
			assert.strictEqual(errors.length, 1, 'Invalid model field should have only one error');
			assert.strictEqual(errors[0].message, 'A is not B', 'Invalid model error should be set properly from validator');

			errors = model.getErrors('syncB');
			assert.strictEqual(errors.length, 0, 'Valid model field should have zero errors');

			errors = model.getErrors('asyncA');
			assert.strictEqual(errors.length, 1, 'Invalid model field should have only one error');
			assert.strictEqual(errors[0].message, 'A is not B', 'Invalid model error should be set properly from validator');

			errors = model.getErrors('asyncB');
			assert.strictEqual(errors.length, 0, 'Valid model field should have zero errors');
		});
	},

	'#validate specific fields': function() {
		var model = new TestValidationModel();

		return model.validate([ 'syncB', 'asyncB' ]).then(function () {
			assert.isTrue(model.isValid(), 'Validating only known-valid fields should validate to true');
			assert.strictEqual(model.getErrors().length, 0, 'Model should have no errors');

			var errors = model.getErrors('syncB');
			assert.strictEqual(errors.length, 0, 'Valid model field should have zero errors');

			errors = model.getErrors('asyncB');
			assert.strictEqual(errors.length, 0, 'Valid model field should have zero errors');
		});
	},

	'#validate required fields': function() {
		var model = new TestRequiredValidationModel();

		// Set inherited model fields to be valid
		model.set('syncA', 'B');
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
			})
		});
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
