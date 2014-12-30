/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import BindingError = require('../../../binding/BindingError');
import registerSuite = require('intern!object');


registerSuite({
	name: 'mayhem/binding/BindingError',

	constructor: {
		'default message'() {
			var error = new BindingError('', {
				binder: null,
				binding: 'testBinding',
				object: 'testObject',
				path: 'testPath'
			});

			assert.include(error.message, 'testBinding', 'Error message should include \'binding\' property value');
			assert.include(error.message, 'testObject', 'Error message should include \'object\' property value');
		},

		'custom message'() {
			var error = new BindingError('Test binding error message: {binding}, {object}', {
				binder: null,
				binding: 'testBinding',
				object: 'testObject',
				path: 'testPath'
			});

			assert.strictEqual(error.message, 'Test binding error message: testBinding, testObject',
				'Error message should equal custom message with token replacement');
		}
	}
});
