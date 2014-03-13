/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import binding = require('../../../binding/interfaces');
import ObjectTargetProxty = require('../../../binding/proxties/ObjectTargetProxty');
import MockProxty = require('../support/MockProxty');
import registerSuite = require('intern!object');
import util = require('../support/util');

registerSuite({
	name: 'binding/proxties/ObjectTargetProxty',

	'.test': function () {
		var result:boolean = ObjectTargetProxty.test({
				object: {},
				binding: '',
				binder: null
			});

		assert.isTrue(result, 'Should be able to bind an object');

		result = ObjectTargetProxty.test({
			object: 'test',
			binding: '',
			binder: null
		});

		assert.isFalse(result, 'Should not be able to bind a non-Object');
	},

	'basic tests': function () {
		var sourceObject = { foo: '1' },
			source = new ObjectTargetProxty<string>({
				object: sourceObject,
				binding: 'foo',
				binder: null
			}),
			target = new MockProxty<string>({
				object: {},
				binding: '',
				binder: null
			});

		assert.strictEqual(source.get(), sourceObject.foo, 'Bound source property should match value of source property object');

		var handle = source.bindTo(target);
		assert.strictEqual(target.get(), source.get(), 'Bound target value should match source value');

		source.set('2');
		assert.strictEqual(source.get(), '2', 'Bound source property should match value of source property object when updated with source.set');
		assert.strictEqual(sourceObject.foo, '2', 'Setting source property value should update original object');

		sourceObject.foo = '3';
		assert.strictEqual(source.get(), '3', 'Bound source property should match value of source property object when object is updated');
		assert.strictEqual(target.get(), '1', 'Setting source property value should not update target property');

		handle.remove();
		sourceObject.foo = '4';
		assert.strictEqual(source.get(), '4', 'Bound source property should match value of source property object even when target is removed');

		assert.doesNotThrow(function () {
			handle.remove();
		}, 'Removing handle a second time should be a no-op');

		sourceObject.foo = '6';
		source.bindTo(target);
		assert.strictEqual(target.get(), '6', 'Re-binding to target should reset target value');

		sourceObject.foo = '7';
		source.bindTo(target, { setValue: false });
		assert.strictEqual(target.get(), '6', 'Re-binding to target with setValue=false should not reset target value');

		source.bindTo(null);
		sourceObject.foo = '7';
		assert.strictEqual(target.get(), '6', 'Removing binding should stop old target property from updating');

		source.destroy();
		sourceObject.foo = '7';
		assert.isUndefined(source.get(), 'Destroyed source property should no longer have a value from the source property object');

		assert.doesNotThrow(function () {
			source.destroy();
		}, 'Destroying property a second time should be a no-op');

		assert.doesNotThrow(function () {
			source.set('8');
		}, 'Setting the value of a destroyed proxty should be a no-op');
	}
});
