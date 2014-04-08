/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import registerSuite = require('intern!object');
import Error = require('../../../ui/form/Error');

registerSuite({
	name: 'ui/form/Error',

	basic() {
		assert.doesNotThrow(function () {
			var error = new Error();
		});
	}
});
