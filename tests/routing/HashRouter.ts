/// <reference path="../intern" />

// TODO: this needs to be a functional test since HashRouter uses the DOM

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
