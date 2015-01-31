import assert = require('intern/chai!assert');
import BindingError = require('../../../binding/BindingError');
import registerSuite = require('intern!object');

registerSuite({
	name: 'mayhem/binding/BindingError',

	constructor: {
		'default message'() {
			var error = new BindingError('', {
				binder: null,
				object: 'testObject',
				path: 'testPath'
			});

			assert.include(error.message, 'testPath', 'Error message should include \'path\' property value');
			assert.include(error.message, 'testObject', 'Error message should include \'object\' property value');
		},

		'custom message'() {
			var error = new BindingError('Test binding error message: {path}, {object}', {
				binder: null,
				object: 'testObject',
				path: 'testPath'
			});

			assert.strictEqual(error.message, 'Test binding error message: testPath, testObject',
				'Error message should equal custom message with token replacement');
		}
	}
});
