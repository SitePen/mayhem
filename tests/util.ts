/// <reference path="./intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import util = require('../util');

registerSuite({
	name: 'util',

	'.getObjectKeys': function () {
		var expected = [ 'a', 'b', 'c' ],
			object:any = { a: 1, b: 2 };

		object.c = 3;

		assert.deepEqual(util.getObjectKeys(object), expected);
	},

	'.isEqual': function () {
		var object = {};
		assert.isTrue(util.isEqual(object, object));
		assert.isTrue(util.isEqual('a', 'a'));
		assert.isTrue(util.isEqual(NaN, NaN));
		assert.isFalse(util.isEqual({}, {}));
		assert.isFalse(util.isEqual('a', 'b'));
		assert.isFalse(util.isEqual('1', 1));
	},

	'.createTimer': function () {
		var dfd:IInternDeferred<void> = this.async(500, 2),
			startDate:number = +new Date();

		util.createTimer(dfd.callback(function () {
			assert.closeTo(+new Date() - startDate, 0, 50, 'Timer with zero delay should fire as soon as possible');
		}), 0);

		util.createTimer(dfd.callback(function () {
			assert.closeTo(+new Date() - startDate, 50, 100, 'Timer with 50ms delay should fire around 50ms');
		}), 50);
	},

	'.debounce': function () {
		var dfd:IInternDeferred<void> = this.async(500),
			actual = 0,
			expected = 2 + 8;

		var debounced = util.debounce(dfd.rejectOnError(function (increment) {
			actual += increment;

			if (actual < 4) {
				debounced(4);
				debounced(8);
			}
			else {
				assert.strictEqual(actual, expected, 'Debounced function should be invoked only once per loop');
				dfd.resolve(null);
			}
		}));

		debounced(1);
		debounced(2);
	}
});
