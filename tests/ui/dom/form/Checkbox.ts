/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Checkbox = require('../../../../ui/dom/form/Checkbox');

registerSuite({
	name: 'ui/dom/form/Checkbox',

	basic() {
		var checkbox = new Checkbox();
	}
});
