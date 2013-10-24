/// <reference path="../intern.d.ts" />

import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import Es5SimpleDataBinder = require('../../binding/Es5SimpleDataBinder');

var binder:Es5SimpleDataBinder;

registerSuite({
	name: 'Es5SimpleDataBinder',

	setup: function () {
		binder = new Es5SimpleDataBinder();
	},

	'basic binding': function () {
		var a = { foo: 'hello' },
			b = { foo: null },
			binding:IDataBindingArguments = {
				source: a,
				sourceBinding: 'foo',
				target: b,
				targetBinding: 'foo'
			};

		var canBind = binder.test(binding);

		assert.isTrue(canBind);

		var handle = binder.bind(binding);

		assert.strictEqual(b.foo, 'hello', 'When binding source to target, target should receive current value of ' +
			'source');

		a.foo = 'world';

		assert.strictEqual(b.foo, 'world', 'Changing bound source property should update target property');

		handle.remove();

		a.foo = 'hello';

		assert.strictEqual(a.foo, 'hello', 'When removing binding, source should still be writable');
		assert.strictEqual(b.foo, 'world', 'After binding is removed, target should not be updated');
	},

	'accessor binding': function () {

	},

	'invalid binding': function () {
		var a = { foo: 'hello' },
			b = { foo: null },
			binding:IDataBindingArguments = {
				source: a,
				sourceBinding: 'foo',
				target: b,
				targetBinding: 'foo'
			};

		Object.freeze(a);

		var canBind = binder.test(binding);

		assert.isFalse(canBind);
	}
});
