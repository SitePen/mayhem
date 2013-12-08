/// <reference path="intern.d.ts" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Scheduler = require('../Scheduler');

registerSuite({
	name: 'Scheduler',

	'basic tests': function () {
		var scheduler = new Scheduler(),
			actual:string[] = [],
			expected = [
				// only the last scheduled item for a given ID should execute
				'z2',
				// scheduled items should be executed in the order they are added
				'b',
				// post-dispatch callbacks should only fire once and should be fired in the order they are added
				'n1',
				'n2',
				// dispatch should occur automatically without an explicit call to `dispatch`
				'a3'
			],
			dfd = this.async(1000),
			handle:IHandle;

		scheduler.schedule('z', function () { actual.push('z1'); });
		scheduler.schedule('z', function () { actual.push('z2'); });
		scheduler.schedule('b', function () { actual.push('b'); });
		scheduler.afterNext(function () { actual.push('n1'); });
		scheduler.afterNext(function () { actual.push('n2'); });
		scheduler.dispatch();

		handle = scheduler.schedule('c', function () { actual.push('c'); });
		handle.remove();

		assert.doesNotThrow(function () {
			handle.remove();
		}, 'Second call to remove schedule handle should be a no-op');

		handle = scheduler.afterNext(function () { actual.push('n3'); });
		handle.remove();

		assert.doesNotThrow(function () {
			handle.remove();
		}, 'Second call to remove schedule handle should be a no-op');

		scheduler.schedule('a', function () { actual.push('a3'); });
		scheduler.afterNext(dfd.callback(function () {
			assert.deepEqual(actual, expected, 'Scheduler should execute in expected order');
		}));
	},

	'scheduling from callback': function () {
		var scheduler = new Scheduler(),
			actual:string[] = [],
			expected = [ 'a', 'b', 'c', 'd', 'e', 'f' ],
			dfd:IInternDeferred<any> = this.async(1000);

		scheduler.schedule('a', function () {
			actual.push('a');
			// Rescheduling with the same ID from within the callback should schedule for the next loop
			scheduler.schedule('a', function () { actual.push('c'); });
		});
		scheduler.afterNext(dfd.rejectOnError(function () {
			// Scheduling within a post-callback should wait for the next event loop
			scheduler.schedule('b', function () { actual.push('d'); });
			scheduler.schedule('c', function () { actual.push('e'); });
			actual.push('b');
			// Adding a post-dispatch callback within a callback should wait for the next event loop
			scheduler.afterNext(dfd.callback(function () {
				actual.push('f');
				assert.deepEqual(actual, expected);
			}));
		}));
	}
});
