/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import FormError = require('../../../ui/form/Error');

registerSuite({
	name: 'ui/form/Error',

	basic() {
		assert.doesNotThrow(() => new FormError());
	}
});
