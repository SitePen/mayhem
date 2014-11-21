/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import util = require('../../../util');
import registerSuite = require('intern!object');

registerSuite({
	name: 'mayhem/util',

	'.createHandle'() {
		var count = 0;
		var handle = util.createHandle(function ():void {
			count++;
		});

		handle.remove();
		assert.strictEqual(count, 1);

		// Remove should be a no-op on subsequent calls
		handle.remove();
		assert.strictEqual(count, 1);
	},

	'.createCompositeHandle'() {
		var count = 0;
		function destructor():void {
			count++;
		}
		var handle = util.createCompositeHandle(
			util.createHandle(destructor),
			util.createHandle(destructor)
		);

		handle.remove();
		assert.strictEqual(count, 2);
	},

	'.createTimer': {
		'timer'() {
			var dfd = this.async(50);

			util.createTimer(function ():void {
				dfd.resolve();
			});
		},

		// TODO: is this a good thing to test? is this a good way to test it?
		// Is it safe to assume the timers will run in the desired order, or could varying browser/platform clock
		// resolution invalidate this test?
		'cancel timer'() {
			var dfd = this.async(50);
			var handle = util.createTimer(function ():void {
				dfd.reject(new Error('timer should be canceled'))
			}, 20);

			util.createTimer(function ():void {
				handle.remove();
			});

			util.createTimer(function (): void {
				dfd.resolve();
			}, 25);
		}
	},

	'.debounce': {
		'function execution is delayed'() {
			var dfd = this.async(50);
			var delay = 20;
			var lastTick:number;

			var debouncedFunction = util.debounce(function ():void {
				if (((new Date()).getTime() - lastTick) < delay) {
					dfd.reject(new Error('debounced function should not run too soon'));
				}

				dfd.resolve();
			}, delay);

			lastTick = (new Date()).getTime();
			debouncedFunction();
		},

		'method runs in context'() {
			var dfd = this.async(50);
			var context = {
				method: util.debounce(function ():void {
					assert.strictEqual(this, context, 'Context should be preserved');
					dfd.resolve();
				})
			};

			context.method();
		}
	}
});
