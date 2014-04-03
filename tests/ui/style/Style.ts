/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Style = require('../../../ui/style/Style');
import util = require('../util');

var style:Style;

registerSuite({
	name: 'ui/style/Style',

	beforeEach() {
		style = new Style();
	},

	afterEach() {
		style = util.destroy(style);
	},

	'#observe': function () {
		var observed:any = [],
			observer = function (newValue:any, oldValue:any, key:string) {
				observed.push({ newValue: newValue, oldValue: oldValue, key: key });
			}

		var handle = style.observe(observer)
		style.set('display', 'none');
		assert.deepEqual(observed[0], { newValue: 'none', oldValue: undefined, key: 'display' },
			'Global observer should have seen display style updated');

		var heightObserved:any = [];
		style.observe('height', function (newValue:any, oldValue:any) {
			heightObserved.push({ newValue: newValue, oldValue: oldValue });
		});

		style.set('height', '100px');
		assert.deepEqual(observed[1], { newValue: '100px', oldValue: undefined, key: 'height' },
			'Global observer should have seen height style updated');
		assert.deepEqual(heightObserved[0], { newValue: '100px', oldValue: undefined },
			'Height observer should have seen height style updated');

		handle.remove();
		style.set('display', 'visible');
		assert.lengthOf(observed, 2, 'Global observer should not have observed another change');

		assert.doesNotThrow(function () {
			handle.remove();
		}, 'Removing handle a second time should not throw');

		style.observe('padding-top', function () {});
		assert.throws(function () {
			style.set('padding-top', 0);
		}, Error, /CSS properties in JavaScript/, 'Setting property with hyphenated name should throw');
	}
});
