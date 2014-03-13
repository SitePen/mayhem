/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import binding = require('../../binding/interfaces');
import MockProxty = require('./support/MockProxty');
import registerSuite = require('intern!object');
import has = require('dojo/has');

registerSuite({
	name: 'binding/BindingProxty',

	'basic tests': function () {
		var bindingArgs:binding.IProxtyArguments = {
				object: { foo: '1' },
				binding: 'foo',
				binder: null
			},
			proxty = new MockProxty(bindingArgs);

		assert.isDefined(proxty.id, 'Proxty should have an id');

		var oldEs5 = has('es5');
		has.add('es5', oldEs5 ? false : true, true, true);

		bindingArgs.object = { foo: '2' };
		proxty = new MockProxty(bindingArgs);
		assert.isDefined(proxty.id, 'Proxty should have an id');

		has.add('es5', oldEs5, true, true);
	}
});
