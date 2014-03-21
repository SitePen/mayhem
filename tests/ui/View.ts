/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import View = require('../../ui/View');
import Widget = require('../../ui/Widget');
import ui = require('../../ui/interfaces');
import MockWidget = require('../mocks/ui/Widget');
import MockRenderer = require('../mocks/ui/Renderer');
import Deferred = require('dojo/Deferred');
import util = require('./util');

var view:View;

registerSuite({
	name: 'ui/View',

	setup() {
		Widget.prototype._renderer = <any> new MockRenderer();
	},

	teardown() {
		Widget.prototype._renderer = undefined;
	},

	beforeEach() {
		view = new View();
	},

	afterEach() {
		if (view) {
			view.destroy();
			view = null;
		}
	}
});
