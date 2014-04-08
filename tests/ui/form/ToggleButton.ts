/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import ToggleButton = require('../../../ui/form/ToggleButton');

registerSuite({
	name: 'ui/form/ToggleButton',

	basic() {
		assert.doesNotThrow(function () {
			var togglebutton = new ToggleButton();
		});
	}
});
