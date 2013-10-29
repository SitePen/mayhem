/// <reference path="../intern.d.ts" />

import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import StatefulDataBinder = require('../../binding/StatefulDataBinder');
import Stateful = require('dojo/Stateful');

var binder:StatefulDataBinder;

registerSuite({
	name: 'StatefulDataBinder',

	setup: function () {
		binder = new StatefulDataBinder();
	},

	teardown: function () {
		binder = null;
	},

	'basic binding': function () {
		var a = new Stateful({ foo: 'hello' }),
			b = new Stateful({ foo: null }),
			binding:IDataBindingArguments = {
				source: a,
				sourceBinding: 'foo',
				target: b,
				targetBinding: 'foo'
			};

		var canBind = binder.test(binding);

		assert.isTrue(canBind);

		var handle = binder.bind(binding);

		assert.strictEqual(b.get('foo'), 'hello', 'When binding source to target, target should receive current value '
			+ 'of source');

		a.set('foo', 'world');

		assert.strictEqual(b.get('foo'), 'world', 'Changing bound source property should update target property');

		handle.remove();

		a.set('foo', 'hello');

		assert.strictEqual(a.get('foo'), 'hello', 'When removing binding, source should still be writable');
		assert.strictEqual(b.get('foo'), 'world', 'After binding is removed, target should not be updated');
	},

	'nested binding': function () {
		var foo = new Stateful({ bar: 'hello' }),
			a = new Stateful({ foo: foo }),
			b = new Stateful({ foo: null }),
			binding:IDataBindingArguments = {
				source: a,
				sourceBinding: 'foo.bar',
				target: b,
				targetBinding: 'foo'
			};

		var canBind = binder.test(binding);

		assert.isTrue(canBind);

		var handle = binder.bind(binding);
		assert.strictEqual(b.get('foo'), 'hello', 'When binding source to target, target should receive current value '
			+ 'of source');

		foo.set('bar', 'world');
		assert.strictEqual(b.get('foo'), 'world', 'Changing bound source property should update target property');

		a.set('foo', new Stateful({ bar: 'universe' }));
		assert.strictEqual(b.get('foo'), 'universe', 'Changing bound parent object property should update target '
			+ 'property');

		foo.set('bar', 'multiverse');
		assert.strictEqual(b.get('foo'), 'universe', 'Changing no longer bound source object should not update target '
			+ 'property');

		handle.remove();

		a.get('foo').set('bar', 'hello');

		assert.strictEqual(a.get('foo').get('bar'), 'hello', 'When removing binding, source should still be writable');
		assert.strictEqual(b.get('foo'), 'universe', 'After binding is removed, target should not be updated');
	},

	'lazy nested binding': function () {

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

		var canBind = binder.test(binding);

		assert.isFalse(canBind);
		assert.throws(function () {
			binder.bind(binding);
		}, /has no method .watch.$/);
	}
});
