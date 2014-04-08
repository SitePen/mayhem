/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import TextField = require('../../../../ui/dom/form/TextField');

registerSuite({
	name: 'ui/dom/form/TextField',

	basic() {
		var textfield = new TextField();
	}
});
