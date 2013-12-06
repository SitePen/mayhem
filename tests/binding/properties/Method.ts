/// <reference path="../../intern.d.ts" />

import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import util = require('../util');
import binding = require('../../../binding/interfaces');
import MethodBinder = require('../../../binding/properties/Method');
import Es5Binder = require('../../../binding/properties/Es5');
import MockBinder = require('../support/MockBinder');

var registry:binding.IPropertyRegistry;

registerSuite({
	name: 'binding/properties/Method',

	setup: function () {
		MethodBinder.methods = {
			toUpperCase: function (value:any):string {
				return String(value).toUpperCase();
			}
		};

		registry = util.createPropertyRegistry();
		registry.add(MethodBinder);
		registry.add(Es5Binder);
	},

	teardown: function () {
		MethodBinder.methods = {};
		registry = null;
	},

	'.test': function () {
		var result = MethodBinder.test({
			object: {},
			binding: 'toUpperCase(foo)',
			registry: registry
		});

		assert.isTrue(result, 'Should be able to bind an object when the method name is registered');

		result = MethodBinder.test({
			object: {},
			binding: 'noSuchMethod(foo)',
			registry: registry
		});

		assert.isFalse(result, 'Should not be able to bind an object when the method name is not registered');

		result = MethodBinder.test({
			object: {},
			binding: 'foo',
			registry: registry
		});

		assert.isFalse(result, 'Should not be able to bind an object when there is no method');
	},

	'basic tests': function () {
		var sourceObject = { foo: 'aaa' },
			source = new MethodBinder({
				object: sourceObject,
				binding: 'toUpperCase(foo)',
				registry: registry
			}),
			target = new MockBinder({
				object: {},
				binding: '',
				registry: null
			});

		// TODO: Not sure if source.get() should be returning the mutated value or not; it may be that the mutated
		// value should only ever be assigned to the target.
		assert.strictEqual(source.get(), 'AAA', 'Bound source property should match value of source property object');

		var handle = source.bindTo(target);
		assert.strictEqual(target.get(), source.get(), 'Bound target value should match source value');

		source.set('bbb');
		assert.strictEqual(source.get(), 'BBB', 'Bound source property should match value of source property object');
		assert.strictEqual(sourceObject.foo, 'bbb', 'Setting source property value should update original object');

		sourceObject.foo = 'ccc';
		assert.strictEqual(source.get(), 'CCC', 'Bound source property should match value of source property object');
		assert.strictEqual(target.get(), 'CCC', 'Setting source property value should update target property');

		handle.remove();
		sourceObject.foo = 'ddd';
		assert.strictEqual(source.get(), 'DDD', 'Bound source property should match value of source property object');
		assert.strictEqual(target.get(), 'CCC', 'Removing binding should stop old target property from updating');

		try {
			handle.remove();
		}
		catch (error) {
			assert.fail(error, null, 'Removing handle a second time should be a no-op');
		}

		source.bindTo(target);
		sourceObject.foo = 'eee';
		assert.strictEqual(target.get(), 'EEE', 'Setting source property value should update target property');

		source.bindTo(null);
		sourceObject.foo = 'fff';
		assert.strictEqual(target.get(), 'EEE', 'Removing binding should stop old target property from updating');

		source.destroy();
		sourceObject.foo = 'ggg';
		assert.isUndefined(source.get(), 'Destroyed source property should no longer have a value from the source property object');

		try {
			source.destroy();
		}
		catch (error) {
			assert.fail(error, null, 'Destroying property a second time should be a no-op');
		}
	}
});
