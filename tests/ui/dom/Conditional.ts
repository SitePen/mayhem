/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Conditional = require('../../../ui/dom/Conditional');

// covered by dom/Widget tests

registerSuite({
	name: 'ui/dom/Conditional',

	basic() {
		var conditional = new Conditional();
	}
});
