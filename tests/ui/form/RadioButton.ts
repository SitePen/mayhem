/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import RadioButton = require('../../../ui/form/RadioButton');

registerSuite({
	name: 'ui/form/RadioButton',

	basic() {
		assert.doesNotThrow(() => new RadioButton());
	}
});
