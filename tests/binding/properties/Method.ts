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
			binding: 'a.b.c',
			registry: null
		});

		assert.isTrue(result, 'Should be able to bind to a Stateful object');

		result = StatefulBinder.test({
			object: {},
			binding: 'a.b.c',
			registry: null
		});

		assert.isFalse(result, 'Should not be able to bind to a non-Stateful object');

		result = StatefulBinder.test({
			object: null,
			binding: 'a.b.c',
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
		assert.strictEqual(source.get(), null, 'Destroyed source property should no longer have a value from the source property object');

		try {
			source.destroy();
		}
		catch (error) {
			assert.fail(error, null, 'Destroying property a second time should be a no-op');
		}
	},

	'nested objects': function () {
		var parentObject = new Stateful({ intermediate: null }),
			intermediateObject = new Stateful({ child: null }),
			childObject = new Stateful({ foo: '1' }),
			source = new StatefulBinder({
				object: parentObject,
				binding: 'intermediate.child.foo',
				registry: null
			}),
			target = new MockBinder({
				object: {},
				binding: '',
				registry: null
			});

		assert.strictEqual(source.get(), undefined, 'Source property should have no value until child object is available');
		parentObject.set('intermediate', intermediateObject);
		assert.strictEqual(source.get(), undefined, 'Source property should have no value until child object is available');
		intermediateObject.set('child', childObject);
		assert.strictEqual(source.get(), '1', 'Source property should have value when child object becomes available');
		intermediateObject.set('child', null);
		assert.strictEqual(source.get(), undefined, 'Source property should lose value when child object becomes unavailable');
		intermediateObject.set('child', childObject);
		assert.strictEqual(source.get(), '1', 'Source property should have value when child object becomes available');
		parentObject.set('intermediate', null);
		assert.strictEqual(source.get(), undefined, 'Source property should lose value when child object becomes unavailable');

		assert.throws(function () {
			parentObject.set('intermediate', {});
		}, /Object is not Stateful/, 'Setting non-Stateful object in binding chain should throw error');

		parentObject.set('intermediate', intermediateObject);
		intermediateObject.set('child', null);

		assert.throws(function () {
			intermediateObject.set('child', {});
		}, /Object is not Stateful/, 'Setting non-Stateful object in binding chain should throw error');
	}
});
