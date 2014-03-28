/// <reference path="../dojo" />
/// <reference path="./intern" />

import assert = require('intern/chai!assert');
import Mediator = require('../data/Mediator');
import registerSuite = require('intern!object');
import Stateful = require('dojo/Stateful');

class ComputedTestMediator extends Mediator {
	computedProperties = {
		firstName: [ 'fullName' ],
		lastName: [ 'fullName' ]
	};

	firstName:string = '';
	lastName:string = '';

	private _fullNameGetter():string {
		return this.firstName + ' ' + this.lastName;
	}

	private _fullNameSetter(fullName:string):void {
		var name = fullName.split(' ');
		this.set({
			firstName: name[0],
			lastName: name[1]
		});
	}
}

registerSuite({
	name: 'Mediator',

	'basic tests': function ():void {
		var model:Stateful = new Stateful({
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

	'watch single property': function ():void {
		var mediator:Mediator = new Mediator({
				foo: 'hello'
			}),
			dfd:IInternDeferred<void> = this.async(500),
			numCallbacks = 0;

		var handle = mediator.observe('foo', function (newValue:string, oldValue:string, key?:string):void {
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
		});

		mediator.set('foo', 'world');
		mediator.set('foo', 'universe');
	},

	// 'watch all properties': function () {
	// 	var mediator:Mediator = new Mediator({
	// 			foo: 'hello',
	// 			bar: undefined
	// 		}),
	// 		dfd:IInternDeferred<void> = this.async(500),
	// 		numCallbacks = 0,
	// 		expected = [ 'foo', 'hello', 'universe', 'bar', undefined, 'red' ],
	// 		actual:any[] = [];

	// 	var handle = mediator.observe(dfd.rejectOnError(function (newValue:string, oldValue:string, key:string) {
	// 		++numCallbacks;

	// 		actual.push(key, oldValue, newValue);

	// 		if (numCallbacks === 2) {
	// 			handle.remove();
	// 			mediator.set('foo', 'multiverse');
	// 			mediator.set('bar', 'green');

	// 			// TODO: When the scheduler is exposed publicly, it should expose a mechanism for telling whether or not
	// 			// a callback is scheduled in future and retrieving a promise that resolves when the next notification
	// 			// fires. For the moment we set a timeout that resolves the promise
	// 			setTimeout(dfd.callback(function () {
	// 				assert.deepEqual(actual, expected);
	// 			}), 50);
	// 		}
	// 	}));

	// 	mediator.set({
	// 		foo: 'world',
	// 		bar: 'blue'
	// 	});
	// 	mediator.set({
	// 		foo: 'universe',
	// 		bar: 'red'
	// 	});
	// },

	'computed property': function ():void {
		var mediator:ComputedTestMediator = new ComputedTestMediator(),
			dfd = this.async(250),
			numCallbacks = 0;

		mediator.observe('fullName', dfd.rejectOnError(function (newValue:string, oldValue:string, key:string):void {
			++numCallbacks;

			assert.strictEqual(newValue, 'Joe Bloggs', 'Computed property callback should fire when its dependent ' +
				'properties are changed and use the correct final value');

			// TODO: When the scheduler is exposed publicly, it should expose a mechanism for telling whether or not
			// a callback is scheduled in future and retrieving a promise that resolves when the next notification
			// fires. For the moment we set a timeout that resolves the promise
			setTimeout(dfd.callback(function ():void {
				assert.strictEqual(numCallbacks, 1, 'Callback should only be called once on a computed property, ' +
					'just like a regular property with multiple updates per event loop');
			}), 50);
		}));

		mediator.set({
			firstName: 'Joe',
			lastName: 'Bloggs'
		});
	}
});
