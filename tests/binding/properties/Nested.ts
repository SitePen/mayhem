/// <reference path="../../intern.d.ts" />
/// <reference path="../../../binding/interfaces.ts" />
/// <reference path="../../../interfaces.ts" />

import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import util = require('../util');
import NestedBinder = require('../../../binding/properties/Nested');
import StatefulBinder = require('../../../binding/properties/Stateful');
import Es5Binder = require('../../../binding/properties/Es5');
import Stateful = require('dojo/Stateful');
import DataBindingDirection = require('../../../binding/DataBindingDirection');
import MockBinder = require('../support/MockBinder');

var registry:IPropertyRegistry;

registerSuite({
	name: 'binding/properties/Nested',

	beforeEach: function () {
		registry = util.createPropertyRegistry();
		registry.add(StatefulBinder);
	},

	teardown: function () {
		registry = null;
	},

	'.test': function () {
		var result = NestedBinder.test({
			object: new Stateful({}),
			binding: 'a.b',
			registry: null
		});

		assert.isTrue(result, 'Should be able to bind when using a nested binding');

		result = NestedBinder.test({
			object: {},
			binding: 'a',
			registry: null
		});

		assert.isFalse(result, 'Should not be able to bind when not using a nested binding');

		result = NestedBinder.test({
			object: null,
			binding: 'a.b',
			registry: null
		});

		assert.isFalse(result, 'Should not be able to bind to a null object');
	},

	'basic tests': function () {
		var parentObject = new Stateful({ intermediate: null }),
			intermediateObject = new Stateful({ child: null }),
			childObject = new Stateful({ foo: '1' }),
			source = new NestedBinder({
				object: parentObject,
				binding: 'intermediate.child.foo',
				registry: registry
			}),
			target = new MockBinder({
				object: {},
				binding: '',
				registry: null
			}),
			handle = source.bindTo(target);

		assert.strictEqual(source.get(), undefined, 'Source property should have no value until child object is available');
		assert.strictEqual(target.get(), undefined, 'Target property should have no value until child object is available');
		parentObject.set('intermediate', intermediateObject);
		assert.strictEqual(source.get(), undefined, 'After setting intermediate object, source property should have no value until child object is available');
		assert.strictEqual(target.get(), undefined, 'After setting intermediate object, target property should have no value until child object is available');
		intermediateObject.set('child', childObject);
		assert.strictEqual(source.get(), '1', 'Source property should have value when child object becomes available');
		assert.strictEqual(target.get(), '1', 'Target property should have value when child object becomes available');
		intermediateObject.set('child', null);
		assert.strictEqual(source.get(), undefined, 'Source property should lose value when child object becomes unavailable');
		assert.strictEqual(target.get(), undefined, 'Target property should lose value when child object becomes unavailable');
		intermediateObject.set('child', childObject);
		assert.strictEqual(source.get(), '1', 'Source property should have value when child object becomes available again');
		assert.strictEqual(target.get(), '1', 'Target property should have value when child object becomes available again');
		parentObject.set('intermediate', null);
		assert.strictEqual(source.get(), undefined, 'Source property should lose value when child object becomes unavailable again');
		assert.strictEqual(target.get(), undefined, 'Target property should lose value when child object becomes unavailable again');

		assert.throws(function () {
			parentObject.set('intermediate', {});
		}, /No registered property binders understand the requested binding/, 'Setting non-bindable object in binding chain should throw error');

		parentObject.set('intermediate', intermediateObject);
		intermediateObject.set('child', null);

		assert.throws(function () {
			intermediateObject.set('child', { farbrausch: true });
		}, /No registered property binders understand the requested binding/, 'Setting non-bindable object at end of binding chain should throw error');

		var registryHandle = registry.add(Es5Binder),
			plainIntermediateObject:{ child?:{ foo?:string; }; } = {};

		assert.doesNotThrow(function () {
			parentObject.set('intermediate', plainIntermediateObject);
		}, 'Setting an intermediate object using a different binder than other objects in the chain should work');

		assert.doesNotThrow(function () {
			plainIntermediateObject.child = { foo: '2' };
		}, 'Setting the last object using a different binder than other objects in the chain should work');

		assert.strictEqual(source.get(), '2', 'Source property should have value when child object becomes available again using a different binder');
		assert.strictEqual(target.get(), '2', 'Target property should have value when child object becomes available again using a different binder');

		plainIntermediateObject.child.foo = '3';

		assert.strictEqual(source.get(), '3', 'Source property should have value when final property is changed using a different binder');
		assert.strictEqual(target.get(), '3', 'Target property should have value when final property is changed using a different binder');

		source.set('4');
		assert.strictEqual(plainIntermediateObject.child.foo, '4', 'Setting source property should set value of underlying object');

		handle.remove();
		assert.doesNotThrow(function () {
			handle.remove();
		}, 'Calling remove on handle a second time should be a no-op');

		plainIntermediateObject.child.foo = '5';
		assert.strictEqual(source.get(), '5', 'Source should continue to receive updates after target is removed');
		assert.strictEqual(target.get(), '4', 'Target should no longer receive updates after being removed');

		source.bindTo(target);
		plainIntermediateObject.child.foo = '6';
		assert.strictEqual(source.get(), '6', 'Source should continue to receive updates after new target is added');
		assert.strictEqual(target.get(), '6', 'New target should receive updates');

		source.bindTo(null);
		plainIntermediateObject.child.foo = '7';
		assert.strictEqual(source.get(), '7', 'Source should continue to receive updates after target is removed');
		assert.strictEqual(target.get(), '6', 'Old target should not receive updates');

		source.destroy();
		assert.doesNotThrow(function () {
			source.destroy();
		}, 'Calling destroy on source a second time should be a no-op');

		assert.isUndefined(source.get(), 'Destroyed source property should no longer have a value from the source property object');
	}
});
