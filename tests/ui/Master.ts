/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Master = require('../../ui/Master');
import ContentView = require('../../ui/ContentView');
import ui = require('../../ui/interfaces');
import MockRenderer = require('../mocks/ui/Renderer');

var master:Master,
	contentViewRenderer = ContentView.prototype._renderer;

registerSuite({
	name: 'ui/Master',

	setup: function () {
		ContentView.prototype._renderer = <any> new MockRenderer();
	},

	teardown: function () {
		ContentView.prototype._renderer = contentViewRenderer;
	},

	'#attachToWindow': function () {
		master = new Master();
		master.destroy();
	}
});
