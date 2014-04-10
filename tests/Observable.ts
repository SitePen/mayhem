/// <reference path="./intern" />

import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import Observable = require('../Observable');

registerSuite({
	name: 'Observable',

	'constructor sets values from kwArgs' () {
		var observable = new Observable({
			foo: 'bar',
			baz: 'quux'
		});
		assert.strictEqual(observable.get('foo'), 'bar');
		assert.strictEqual(observable.get('baz'), 'quux');
	},

	// TODO: Do we still need has?
	/*'#has' () {
		var observable = new Observable({
			foo: 'bar'
		});
		assert.isTrue(observable.has('foo'));
		assert.isFalse(observable.has('baz'));
	},*/

	'#get and #set' () {
		var observable = new Observable();

		assert.isUndefined(observable.get('foo'));

		observable.set('foo', 'bar');
		assert.strictEqual(observable.get('foo'), 'bar');
		
		observable.set({
			foo: 'baz',
			bar: 'quux'
		});
		assert.strictEqual(observable.get('foo'), 'baz');
		assert.strictEqual(observable.get('bar'), 'quux');
	},

	'#observe': {
		'notifies observers when an observed property changes' () {
			var observable = new Observable({
					foo: 'bar'
				}),
				slice = Array.prototype.slice,
				fooObservations:any[] = [],
				bazObservations:any[] = [],
				ignoredPropObservations:any[] = [];

			observable.observe('foo', () => {
				fooObservations.push(slice.call(arguments));
			});
			observable.observe('baz', () => {
				bazObservations.push(slice.call(arguments));
			});
			observable.observe('ignored-prop', () => {
				ignoredPropObservations.push(slice.call(arguments));
			});

			observable.set('foo', 'FOO');
			observable.set('baz', 'BAZ');
			observable.set('foo', 'BAR');
			observable.set('baz', 'QUUX');

			assert.deepEqual(fooObservations, [
				[ 'FOO', 'bar', 'foo' ],
				[ 'BAR', 'FOO', 'foo' ]
			]);
			assert.deepEqual(bazObservations, [
				[ 'BAZ', undefined, 'baz' ],
				[ 'QUUX', 'BAZ', 'baz' ]
			]);
			assert.deepEqual(ignoredPropObservations, []);
		},
		
		'calls observers in Observable\'s context' () {
			var observable = new Observable(),
				context:any;
			
			observable.observe('foo', () => {
				context = this;
			});
			observable.set('foo', 'bar');

			assert.strictEqual(context, this);
		},

		'returns a handle for removing observer' () {
			var observable = new Observable(),
				count = 0,
				handle = observable.observe('foo', () => {
					count++;
				});

			assert.strictEqual(count, 0);
			observable.set('foo', 'bar');
			assert.strictEqual(count, 1);
			observable.set('foo', 'baz');
			assert.strictEqual(count, 2);
			handle.remove();
			observable.set('foo', 'quux');
			assert.strictEqual(count, 2);
		}
	}
});
