/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import FramedPlaceholder = require('../../../ui/dom/FramedPlaceholder');

// covered by dom/Widget tests

registerSuite({
	name: 'ui/dom/FramedPlaceholder',

	basic():void {
		var conditional = new FramedPlaceholder();
	}
});