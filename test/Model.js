define([
	'teststack!object',
	'teststack/assert',
	'dojo/_base/declare',
	'dojo/Deferred',
	'../Model'
], function (registerSuite, assert, declare, Deferred, Model) {
	registerSuite({
		name: 'Model',

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
		}
	});
});