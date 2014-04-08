/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import TextArea = require('../../../../ui/dom/form/TextArea');

registerSuite({
	name: 'ui/dom/form/TextArea',

	basic() {
		var textarea = new TextArea();
	}
});
