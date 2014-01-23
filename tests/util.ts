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
	}
});
