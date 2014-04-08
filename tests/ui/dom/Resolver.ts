/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Resolver = require('../../../ui/dom/Resolver');

// covered by dom/Widget tests

registerSuite({
	name: 'ui/dom/Resolver',

	basic() {
		var resolver = new Resolver();
	}
});
