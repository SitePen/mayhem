/// <reference path="../intern" />

import Route = require('../../routing/Route');
import HashRouter = require('../../routing/HashRouter');
import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');

registerSuite({
	name: 'HashRouter',

	'#startup': function () {
		var router = new HashRouter();
		router.startup();
	}
});
