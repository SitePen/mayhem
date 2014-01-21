/// <reference path="../../intern.d.ts" />

import assert = require('intern/chai!assert');
import binding = require('../../../binding/interfaces');
import Es5Proxty = require('../../../binding/proxties/Es5Proxty');
import MethodProxty = require('../../../binding/proxties/MethodProxty');
import MockProxty = require('../support/MockProxty');
import registerSuite = require('intern!object');
import util = require('../support/util');

var binder:binding.IProxtyBinder;

registerSuite({
	name: 'binding/proxties/MethodProxty',

	setup: function () {
		MethodProxty.methods = {
			toUpperCase: function (value:any):string {
				return String(value).toUpperCase();
			}
		};

		binder = util.createProxtyBinder();
		// TODO: <any> casting is needed due to TS#1983
		binder.add(<any> MethodProxty);
		binder.add(<any> Es5Proxty);
	},

	teardown: function () {
		MethodProxty.methods = {};
		binder = null;
	},

	'.test': function () {
		var result = MethodProxty.test({
			object: {},
			binding: 'toUpperCase(foo)',
			binder: binder
		});

		assert.isTrue(result, 'Should be able to bind an object when the method name is registered');

		result = MethodProxty.test({
			object: {},
			binding: 'noSuchMethod(foo)',
			binder: binder
		});

		assert.isFalse(result, 'Should not be able to bind an object when the method name is not registered');

		result = MethodProxty.test({
			object: {},
			binding: 'foo',
			binder: binder
		});

		assert.isFalse(result, 'Should not be able to bind an object when there is no method');
	},

	'basic tests': function () {
		var sourceObject = { foo: 'aaa' },
			source = new MethodProxty<string, string>({
				object: sourceObject,
				binding: 'toUpperCase(foo)',
				binder: binder
			}),
			target = new MockProxty<string>({
				object: {},
				binding: '',
				binder: null
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
