/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import TextField = require('../../../ui/form/TextField');

registerSuite({
	name: 'ui/form/TextField',

	basic() {
		assert.doesNotThrow(function () {
			var textfield = new TextField();
		});
	}
});
