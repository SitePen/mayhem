/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import binding = require('../../../binding/interfaces');
import ObservableProxty = require('../../../binding/proxties/ObservableProxty');
import Observable = require('../../../Observable');
import MockProxty = require('../support/MockProxty');
import registerSuite = require('intern!object');

registerSuite({
	name: 'binding/proxties/ObservableProxty',

	'.test': function () {
		var result:boolean = ObservableProxty.test({
				object: {
					get: function () {},
					set: function () {},
					observe: function () {}
				},
				binding: '',
				binder: null
			});

		assert.isTrue(result, 'Should be able to bind an Observable');

		result = ObservableProxty.test({
			object: {},
			binding: '',
			binder: null
		});

		assert.isFalse(result, 'Should not be able to bind a non-Observable');
	},

	'basic tests': function () {
		var sourceObject = new Observable({ foo: '1' }),
			source = new ObservableProxty<string>({
				object: sourceObject,
				binding: 'foo',
				binder: null
			}),
			target = new MockProxty<string>({
				object: {},
				binding: 'foo',
				binder: null
			});

		assert.strictEqual(source.get(), sourceObject.get('foo'), 'Bound source property should match value of source property object');

		var handle = source.bindTo(target);
		assert.strictEqual(target.get(), source.get(), 'Target value should match bound source value');

		sourceObject.set('foo', '2');
		assert.strictEqual(source.get(), '2', 'Bound source property should show current value of source');
		assert.strictEqual(target.get(), '2', 'Target value should match value of updated bound source property');

		sourceObject.set('bar', '3');
		assert.strictEqual(target.get(), '2', 'Target value should not change when unbound source property is updated');

		source.set('4');
		assert.strictEqual(sourceObject.get('foo'), '4', 'Bound source property should change when source is updated');

		handle.remove();
		sourceObject.set('foo', '5');
		assert.strictEqual(source.get(), '5', 'Bound source property should match value of source property object even when target is removed');

		assert.doesNotThrow(function () {
			handle.remove();
		}, 'Removing handle a second time should be a no-op');

		sourceObject.set('foo', '6');
		handle = source.bindTo(target);
		assert.strictEqual(target.get(), '6', 'Re-binding to target should reset target value');
		handle.remove();

		sourceObject.set('foo', '7');
		source.bindTo(target, { setValue: false });
		assert.strictEqual(target.get(), '6', 'Re-binding to target with setValue=false should not reset target value');

		source.bindTo(null);
		sourceObject.set('foo', '8');
		assert.strictEqual(target.get(), '6', 'Removing binding should stop old target property from updating');

		source.destroy();
		sourceObject.set('foo', '7');
		assert.isUndefined(source.get(), 'Destroyed source property should no longer have a value from the source property object');

		assert.doesNotThrow(function () {
			source.destroy();
		}, 'Destroying property a second time should be a no-op');

		assert.doesNotThrow(function () {
			source.set('8');
		}, 'Setting the value of a destroyed proxty should be a no-op');
	}
});
