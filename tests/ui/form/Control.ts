/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Control = require('../../../ui/form/Control');

registerSuite({
	name: 'ui/form/Control',

	basic() {
		assert.doesNotThrow(() => new Control());
	}
});
