/// <reference path="../../intern.d.ts" />
/// <reference path="../../../binding/interfaces.ts" />
/// <reference path="../../../interfaces.ts" />

import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import util = require('../util');
import StatefulBinder = require('../../../binding/properties/Stateful');
import Stateful = require('dojo/Stateful');
import DataBindingDirection = require('../../../binding/DataBindingDirection');
import MockBinder = require('../support/MockBinder');

var registry:IDataBindingRegistry;

registerSuite({
	name: 'binding/properties/Stateful',

	setup: function () {
		registry = util.createPropertyRegistry();
		registry.add(StatefulBinder);
	},

	teardown: function () {
		registry = null;
	},

	'.test': function () {
		var result = StatefulBinder.test({
			object: new Stateful({}),
			binding: 'a',
			registry: null
		});

		assert.isTrue(result, 'Should be able to bind to a Stateful object');

		result = StatefulBinder.test({
			object: {},
			binding: 'a',
			registry: null
		});

		assert.isFalse(result, 'Should not be able to bind to a non-Stateful object');

		result = StatefulBinder.test({
			object: null,
			binding: 'a',
			registry: null
		});

		assert.isFalse(result, 'Should not be able to bind to a null object');
	},

	'basic tests': function () {
		var sourceObject = new Stateful({ foo: '1' }),
			source = new StatefulBinder({
				object: sourceObject,
				binding: 'foo',
				registry: null
			}),
			target = new MockBinder({
				object: {},
				binding: '',
				registry: null
			});

		assert.strictEqual(source.get(), sourceObject.get('foo'), 'Bound source property should match value of source property object');

		var handle = source.bindTo(target);
		assert.strictEqual(target.get(), source.get(), 'Bound target value should match source value');

		source.set('2');
		assert.strictEqual(source.get(), '2', 'Bound source property should match value of source property object');
		assert.strictEqual(sourceObject.get('foo'), '2', 'Setting source property value should update original object');

		sourceObject.set('foo', '3');
		assert.strictEqual(source.get(), '3', 'Bound source property should match value of source property object');
		assert.strictEqual(target.get(), '3', 'Setting source property value should update target property');

		handle.remove();
		sourceObject.set('foo', '4');
		assert.strictEqual(source.get(), '4', 'Bound source property should match value of source property object');
		assert.strictEqual(target.get(), '3', 'Removing binding should stop old target property from updating');

		try {
			handle.remove();
		}
		catch (error) {
			assert.fail(error, null, 'Removing handle a second time should be a no-op');
		}

		source.bindTo(target);
		sourceObject.set('foo', '5');
		assert.strictEqual(target.get(), '5', 'Setting source property value should update target property');

		source.bindTo(null);
		sourceObject.set('foo', '6');
		assert.strictEqual(target.get(), '5', 'Removing binding should stop old target property from updating');

		source.destroy();
		sourceObject.set('foo', '7');
		assert.isUndefined(source.get(), 'Destroyed source property should no longer have a value from the source property object');

		try {
			source.destroy();
		}
		catch (error) {
			assert.fail(error, null, 'Destroying property a second time should be a no-op');
		}
	},

	'setting same value': function () {
		var fakeStateful = {
				numSets: 0,
				value: '1',
				get: function () {
					return this.value;
				},
				set: function (key, value) {
					var oldValue = this.value;
					++this.numSets;
				},
				watch: function () {
					return {
						remove: function () {}
					};
				}
			},
			source = new StatefulBinder({
				object: fakeStateful,
				binding: 'foo',
				registry: null
			});

		assert.strictEqual(source.get(), '1');
		source.set('1');
		assert.strictEqual(fakeStateful.numSets, 0, 'Setting the same value on a property that is already set should be a no-op');
		source.set('2');
		assert.strictEqual(fakeStateful.numSets, 1, 'Setting a different value should not be a no-op');
	}/*,

	'registry integration': function () {
		var source = new Stateful({ foo: '1' }),
			target = new Stateful({}),
			dfd = this.async();

		registry.bind({
			source: source,
			sourceBinding: 'foo',
			target: target,
			targetBinding: 'foo',
			direction: DataBindingDirection.TWO_WAY
		});

		assert.strictEqual(target.get('foo'), source.get('foo'), 'Target should match source immediately after binding');

		source.set('foo', '2');

		assert.strictEqual(source.get('foo'), '2', 'Source should update immediately');
		assert.strictEqual(target.get('foo'), '1', 'Target should not update to source until after next scheduler tick');

		registry.app.scheduler.afterNext(dfd.callback(function () {
			assert.strictEqual(target.get('foo'), source.get('foo'), 'Source and target should match after scheduler tick');
		}));
	}*/
});
