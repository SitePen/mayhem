/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Input = require('../../../ui/form/Input');

registerSuite({
	name: 'ui/form/Input',

	basic() {
		assert.doesNotThrow(function () {
			var input = new Input();
		});
	}
});
