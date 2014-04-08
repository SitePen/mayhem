/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import RadioButton = require('../../../../ui/dom/form/RadioButton');

registerSuite({
	name: 'ui/dom/form/RadioButton',

	basic() {
		var radiobutton = new RadioButton();
	}
});
