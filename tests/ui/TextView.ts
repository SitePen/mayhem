/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import TextView = require('../../ui/TextView')

registerSuite({
	name: 'ui/TextView',

	'basic': function () {
		var view = new TextView();
		assert.doesNotThrow(function () {
			view.destroy();
		}, 'Destroy should not throw');
	}
});
