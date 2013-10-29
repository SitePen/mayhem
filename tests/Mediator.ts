/// <reference path="intern.d.ts" />

import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import Mediator = require('../Mediator');
import Stateful = require('dojo/Stateful');

registerSuite({
	name: 'Mediator',

	'basic tests': function () {
		var model:IStateful = new Stateful({
				bar: 'hi'
			}),
			mediator:Mediator = new Mediator({
				foo: 'hello',
				model: model
			});

		assert.strictEqual(mediator.get('foo'), 'hello', 'Object passed to mediator constructor should define ' +
			'default properties of the mediator');

		assert.strictEqual(mediator.get('bar'), 'hi', 'Mediator should delegate to `model` property for properties ' +
			'not defined on the mediator');

		mediator.set('foo', 'world');
		assert.strictEqual(mediator.get('foo'), 'world', 'Setting property on mediator when property exists on ' +
			'mediator should set property on mediator');
		assert.isUndefined(model.get('foo'), 'Setting property on mediator when property exists on mediator should ' +
			'not set property on model');

		mediator.set('bar', 'universe');
		assert.strictEqual(model.get('bar'), 'universe', 'Setting property on mediator when property does not ' +
			'exist on mediator should set property on model');
		assert.strictEqual(mediator.get('bar'), 'universe', 'Setting property on mediator when property does not ' +
			'exist on mediator should get property from model');

		mediator.set('model', null);
		assert.isNull(mediator.get('model'), 'Model should be nullable');

		mediator.set('bar', 'multiverse');
		assert.isUndefined(mediator.get('bar'), 'Properties should not be set on mediator if properties are not ' +
			'defined on the mediator object');
	},

	'watch tests': function () {
		var mediator:Mediator = new Mediator({
				foo: 'hello'
			}),
			dfd:IInternDeferred<void> = this.async(500),
			numCallbacks = 0;

		var handle = mediator.watch('foo', dfd.rejectOnError(function (key:string, oldValue:string, newValue:string) {
			++numCallbacks;

			assert.strictEqual(numCallbacks, 1, 'Watch function should only be called once per event loop, even ' +
				'if there are many changes');

			assert.strictEqual(key, 'foo', 'Key passed to callback should be the same key that was watched');
			assert.strictEqual(oldValue, 'hello', 'Old value should be the original old value of the property');
			assert.strictEqual(newValue, 'universe', 'New value should be the last new value of the property');

			handle.remove();
			mediator.set('foo', 'multiverse');

			// TODO: When the scheduler is exposed publicly, it should expose a mechanism for telling whether or not
			// a callback is scheduled in future and retrieving a promise that resolves when the next notification
			// fires. For the moment we set a timeout that resolves the promise
			setTimeout(dfd.resolve, 50);
		}));

		mediator.set('foo', 'world');
		mediator.set('foo', 'universe');
	}
});
