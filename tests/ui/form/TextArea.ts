/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import TextArea = require('../../../ui/form/TextArea');

registerSuite({
	name: 'ui/form/TextArea',

	basic() {
		assert.doesNotThrow(() => new TextArea());
	}
});
