/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Button = require('../../../ui/form/Button');

registerSuite({
	name: 'ui/form/Button',

	basic() {
		assert.doesNotThrow(function () {
			var button = new Button();
		});
	}
});
