/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import Scheduler = require('../../../Scheduler');
import registerSuite = require('intern!object');

var scheduler:Scheduler;

registerSuite({
	name: 'mayhem/Scheduler',

	beforeEach() {
		scheduler = new Scheduler();
	},

	'#schedule': {
		simple() {
			var dfd = this.async(500);

			scheduler.schedule('test', function ():void {
				dfd.resolve();
			});
		},

		sequence() {
			var dfd = this.async(500);
			var count = 0;

			scheduler.schedule('test1', function ():void {
				count++;
			});

			scheduler.schedule('test2', dfd.callback(function ():void {
				assert.strictEqual(count, 1);
			}));
		},

		nested() {
			var dfd = this.async(500);
			var message = '';

			scheduler.schedule('test1', function ():void {
				message += 'a';

				scheduler.schedule('test3', function ():void {
					message += 'c';
				});

				scheduler.schedule('end', dfd.callback(function ():void {
					assert.strictEqual(message, 'abc');
				}));
			});

			scheduler.schedule('test2', function ():void {
				message += 'b';
			});
		},

		'remove a scheduled task'() {
			var dfd = this.async(500);
			var message = '';
			var handle:IHandle;

			scheduler.schedule('test1', function ():void {
				message += 'a';

				handle = scheduler.schedule('test3', function ():void {
					message += 'XYZ';
				});

				scheduler.schedule('end', dfd.callback(function ():void {
					assert.strictEqual(message, 'ab');
				}));
			});

			scheduler.schedule('test2', function ():void {
				message += 'b';
				handle.remove();
			});
		}
	},

	'#afterNext'() {
		var dfd = this.async(500);
		var message = '';

		scheduler.schedule('test1', function ():void {
			message += 'a';
		});

		scheduler.afterNext(function ():void {
			message += 'c';
		});

		scheduler.schedule('test2', function ():void {
			message += 'b';
		});

		scheduler.afterNext(dfd.callback(function ():void {
			assert.strictEqual(message, 'abc');
		}));
	}
});
