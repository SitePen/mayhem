/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Label = require('../../../ui/form/Label');

registerSuite({
	name: 'ui/form/Label',

	basic() {
		assert.doesNotThrow(() => new Label());
	}
});
