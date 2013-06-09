define([
	'intern!object',
	'intern/assert',
	'dojo/_base/declare',
	'dojo/Deferred',
	'../Model',
	'../validators/RequiredValidator'
], function (registerSuite, assert, declare, Deferred, Model, RequiredValidator) {
	function createPopulatedModel() {
		var model = new (declare(Model, {
			_schema: {
				string: 'string',
				number: 'number',
				boolean: 'boolean',
				object: Object,
				array: Array,
				any: null,
				accessor: 'string'
			},

			_accessorGetter: function () {
				return this._accessor;
			},

			_accessorSetter: function (value) {
				this._accessor = value;
				return value;
			}
		}))();

		model.set({
			string: 'foo',
			number: 1234,
			'boolean': true,
			object: { foo: 'foo' },
			array: [ 'foo', 'bar' ],
			any: 'foo',
			invalid: 'foo',
			accessor: 'foo'
		});

		return model;
	}


	registerSuite({
		name: 'Model',

		'#get and #set': function () {
			var model = createPopulatedModel();

			assert.strictEqual(model.get('string'), 'foo', 'string schema properties should be mutable as strings from an object');
			assert.strictEqual(model.get('number'), 1234, 'number schema properties should be mutable as numbers from an object');
			assert.strictEqual(model.get('boolean'), true, 'boolean schema properties should be mutable as booleans from an object');
			assert.deepEqual(model.get('object'), { foo: 'foo' }, 'Object schema properties should be mutable as objects from an object');
			assert.deepEqual(model.get('array'), [ 'foo', 'bar' ], 'Array schema properties should be mutable as arrays from an object');
			assert.strictEqual(model.get('any'), 'foo', 'null schema properties should be mutable as any value from an object');
			assert.strictEqual(model.get('invalid'), undefined, 'non-existant schema properties should not be mutable from an object');
			assert.strictEqual(model.get('accessor'), 'foo', 'accessors and mutators should work normally');

			model.set('number', 'not-a-number');
			assert.typeOf(model.get('number'), 'number', 'number schema properties should still be numbers even if passed a non-number value');
			assert.isTrue(isNaN(model.get('number')), 'number schema properties should still be set even if passed a non-number value');

			model.set('string', 1234);
			assert.typeOf(model.get('string'), 'string', 'string schema properties should still be strings even if passed a non-string value');
			assert.strictEqual(model.get('string'), '1234', 'string schema properties should still be set even if passed a non-string value');

			model.set('boolean', 'foo');
			assert.typeOf(model.get('boolean'), 'boolean', 'boolean schema properties should still be booleans even if passed a non-boolean value');
			assert.strictEqual(model.get('boolean'), true, 'boolean schema properties should still be set even if passed a non-boolean value');

			model.set('boolean', 'false');
			assert.strictEqual(model.get('boolean'), false, 'setting "false" string to boolean property should set it to false');

			model.set('boolean', '0');
			assert.strictEqual(model.get('boolean'), false, 'setting "0" string to boolean property should set it to false');

			model.set('boolean', []);
			assert.strictEqual(model.get('boolean'), false, 'setting an empty array to boolean property should set it to false');

			model.set('object', 'foo');
			assert.instanceOf(model.get('object'), Object, 'Object schema properties should still be Objects even if passed a non-Object value');
			assert.deepEqual(model.get('object'), { 0: 'f', 1: 'o', 2: 'o' }, 'Object schema properties should still be set even if passed a non-Object value');

			model.set('array', 'foo');
			assert.instanceOf(model.get('array'), Array, 'Array schema properties should still be Arrays even if passed a non-Array value');
			assert.deepEqual(model.get('array'), [ 'foo' ], 'Array schema properties should still be set even if passed a non-Array value');

			model.set('any', 1234);
			assert.typeOf(model.get('any'), 'number', 'any-type schema properties should be the type of the value passed');
			assert.strictEqual(model.get('any'), 1234, 'any-type schema properties should be set regardless of the type of value');

			model.set('invalid', 'foo');
			assert.strictEqual(model.get('invalid'), undefined, 'non-existant schema properties should not be mutable');
		},

		'#revert': function () {
			var model = createPopulatedModel();

			model.revert();

			assert.strictEqual(model.get('string'), undefined, 'Reverted data should be unset when values are uncommitted');
			assert.strictEqual(model.get('number'), undefined, 'Reverted data should be unset when values are uncommitted');
		},

		'#commit': function () {
			var model = createPopulatedModel();

			model.commit();
			model.revert();

			assert.strictEqual(model.get('string'), 'foo', 'Reverted data should not be unset once values are committed');
			assert.strictEqual(model.get('number'), 1234, 'Reverted data should not be unset once values are committed');
		},

		'#save async': function () {
			var model = new Model();

			// If there is an exception in the basic save logic, it will be used to fail the test
			return model.save();
		},

		'#validate async': function () {
			var asyncStringIsBValidator = {
				validate: function (model, key, value) {
					var dfd = new Deferred();
					setTimeout(function () {
						if (value !== 'b') {
							model.addError(key, value + ' is not b');
						}

						dfd.resolve(value === 'b');
					}, 0);

					return dfd.promise;
				}
			};

			var model = new (declare(Model, {
				_schema: { test: 'string' },
				_defaults: { test: 'a', test2: 'b' },
				_validators: {
					test: [ asyncStringIsBValidator ],
					test2: [ asyncStringIsBValidator ]
				}
			}))();

			return model.validate().then(function (isValid) {
				assert.isFalse(isValid, 'Invalid model should validate to false');

				var errors = model.getErrors('test');
				assert.strictEqual(errors.get('length'), 1, 'Invalid model field should have only one error');
				assert.strictEqual(errors.get(0), 'a is not b', 'Invalid model error should be set properly from validator');

				errors = model.getErrors('test2');
				assert.strictEqual(errors.get('length'), 0, 'Valid model field should have zero errors');
			});
		},

		'#isFieldRequired': function () {
			var RequiredValidatorSubclass = declare(RequiredValidator, {});

			var model = new (declare(Model, {
				_validators: {
					requiredField1: [ new RequiredValidator() ],
					requiredField2: [ new RequiredValidatorSubclass() ],
					optionalField: [ ]
				}
			}))();

			assert.isTrue(model.isFieldRequired('requiredField1'), 'Field should be required');
			assert.isTrue(model.isFieldRequired('requiredField2'), 'Field should be required');
			assert.isFalse(model.isFieldRequired('optionalField'), 'Field should not be required');
		}
	});
});