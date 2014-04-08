/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Input = require('../../../../ui/dom/form/Input');

registerSuite({
	name: 'ui/dom/form/Input',

	basic() {
		var input = new Input();
	}
});
