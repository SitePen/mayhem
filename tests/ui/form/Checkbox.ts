/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Checkbox = require('../../../ui/form/Checkbox');

registerSuite({
	name: 'ui/form/Checkbox',

	basic() {
		var checkbox = new Checkbox();
	}
});
