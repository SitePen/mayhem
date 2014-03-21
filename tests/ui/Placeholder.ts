/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import ui = require('../../ui/interfaces');
import Placeholder = require('../../ui/Placeholder');
import MockWidget = require('../mocks/ui/Widget');
import MockRenderer = require('../mocks/ui/Renderer');
import Deferred = require('dojo/Deferred');
import util = require('./util');

var placeholder:Placeholder,
	placeholderRenderer:any = Placeholder.prototype._renderer;

registerSuite({
	name: 'ui/Placeholder',

	setup: function () {
		Placeholder.prototype._renderer = <any> new MockRenderer();
	},

	teardown: function () {
		Placeholder.prototype._renderer = placeholderRenderer;
	},

	beforeEach() {
		placeholder = new Placeholder();
	},

	'#add': function () {
	},

	'#_currentChildSetter': function () {
		var widget = new MockWidget();

		// check that the renderer is adding the widget
		placeholder.set('currentChild', widget);
		assert.deepEqual(placeholder.get('children'), [ widget ], 'Widget should be only child of placeholder');
	}
});
