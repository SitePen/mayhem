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

	teardown: function () {
		binder = null;
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
		var a = {
				_foo: 'world!',
				get foo() {
					return 'hello ' + this._foo;
				},
				set foo(value) {
					this._foo = value + '!';
				}
			},
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

		assert.strictEqual(b.foo, 'hello world!', 'When binding source to target, target should receive current ' +
			'computed value of source');

		a.foo = 'universe';

		assert.strictEqual(b.foo, 'hello universe!', 'Changing bound source property should update target property');

		handle.remove();

		a.foo = 'multiverse';

		assert.strictEqual(a.foo, 'hello multiverse!', 'When removing binding, source should still be writable');
		assert.strictEqual(b.foo, 'hello universe!', 'After binding is removed, target should not be updated');
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
		assert.throws(function () {
			binder.bind(binding);
		}, /^Cannot redefine property/);
	}
});
