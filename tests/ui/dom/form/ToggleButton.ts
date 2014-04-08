/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import ToggleButton = require('../../../../ui/dom/form/ToggleButton');

registerSuite({
	name: 'ui/dom/form/ToggleButton',

	basic() {
		var togglebutton = new ToggleButton();
	}
});
