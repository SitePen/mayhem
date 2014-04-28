/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import ClassList = require('../../../ui/style/ClassList');
import util = require('../support/util');

var classList:ClassList;

registerSuite({
	name: 'ui/style/ClassList',

	beforeEach() {
		classList = new ClassList();
	},

	afterEach() {
		classList = util.destroy(classList);
	},


	'#add': function () {
		classList.add('foo');
		assert.strictEqual(classList.get(), 'foo', 'Class should be foo');
		classList.add('bar');
		assert.strictEqual(classList.get(), 'foo bar', 'Class should be foo bar');
	},

	'#has': function () {
		classList.add('foo');
		assert.isTrue(classList.has('foo'), 'classList should have class foo');
		classList.add('bar');
		assert.isTrue(classList.has('bar'), 'classList should have class bar');
	},

	'#remove': function () {
		classList.add('foo');
		classList.add('bar');
		assert.isTrue(classList.has('foo'), 'classList should have class foo');
		assert.isTrue(classList.has('bar'), 'classList should have class bar');

		classList.remove('foo');
		assert.isFalse(classList.has('foo'), 'classList should not have class foo');
		assert.isTrue(classList.has('bar'), 'classList should have class bar');
	},

	'#toggle': function () {
		classList.toggle('foo');
		assert.isTrue(classList.has('foo'), 'classList should have class foo');
		classList.toggle('foo');
		assert.isFalse(classList.has('foo'), 'classList should not have class foo');

		classList.toggle('foo', false);
		assert.isFalse(classList.has('foo'), 'classList should not have class foo after forcing false');
		classList.toggle('foo', true);
		assert.isTrue(classList.has('foo'), 'classList should have class foo after forcing true');
		classList.toggle('foo', true);
		assert.isTrue(classList.has('foo'), 'classList should still have class foo after forcing true');
	}
});
