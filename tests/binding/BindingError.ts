/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import binding = require('../../binding/interfaces');
import BindingError = require('../../binding/BindingError');
import registerSuite = require('intern!object');

registerSuite({
	name: 'binding/BindingError',

	'basic tests': function () {
		var bindingArgs:binding.IProxtyArguments = {
				object: 'some object',
				binding: 'none',
				binder: null
			},
			error = new BindingError('test error', bindingArgs);

		assert.strictEqual(error.message, 'test error', 'Error should use specified message');

		error = new BindingError(null, bindingArgs);
		assert.strictEqual(error.message, 'Could not create proxty for "{binding}" on {object}.', 'Error should use default message');
		assert.strictEqual('' + error, 'Could not create proxty for "none" on some object.',
			'Error message should be interoplated');
	}
});
