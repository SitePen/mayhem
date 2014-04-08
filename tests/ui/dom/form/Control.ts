/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Control = require('../../../../ui/dom/form/Control');

registerSuite({
	name: 'ui/dom/form/Control',

	basic() {
		var control = new Control();
	}
});
