/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Button = require('../../../../ui/dom/form/Button');

registerSuite({
	name: 'ui/dom/form/Button',

	basic() {
		var button = new Button();
	}
});
