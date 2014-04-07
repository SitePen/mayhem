/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import ui = require('../../ui/interfaces');
import Placeholder = require('../../ui/Placeholder');
import PlacePosition = require('../../ui/PlacePosition');
import Widget = require('../mocks/ui/Widget');
import MockRenderer = require('../mocks/ui/Renderer');
import Deferred = require('dojo/Deferred');
import util = require('./util');

var placeholder:Placeholder,
	placeholderRenderer:any = Placeholder.prototype._renderer;

registerSuite({
	name: 'ui/Placeholder',

	setup() {
		Placeholder.prototype._renderer = new MockRenderer();
	},

	teardown() {
		Placeholder.prototype._renderer = placeholderRenderer;
	},

	beforeEach() {
		placeholder = new Placeholder();
	},

	'#add': function () {
		var widget1 = new Widget(),
			widget2 = new Widget();
		placeholder.add(widget1);
		assert.deepEqual(placeholder.get('children'), [ widget1 ], 'widget1 should be only child of placeholder');

		assert.throws(function () {
			placeholder.add(widget2, PlacePosition.FIRST);
		}, Error, /Placeholder can only have a single child/,
		'Adding a widget to a placeholder anywhere but ONLY should throw');

		// TODO: this shouldn't work
		assert.throws(function () {
			placeholder.add(widget2, 1);
		}, Error, /Placeholder can only have a single child/,
		'Adding a widget to a placeholder in a position other than ONLY should throw');
	},

	'#_currentChildSetter': function () {
		var widget = new Widget();

		// check that the renderer is adding the widget
		placeholder.set('currentChild', widget);
		assert.deepEqual(placeholder.get('children'), [ widget ], 'Widget should be only child of placeholder');

		// setting a null child should empty the widget
		placeholder.set('currentChild', null);
		assert.deepEqual(placeholder.get('children'), [], 'Widget should be empty');
	},

	'#_currentChildGetter': function () {
		var widget = new Widget();

		// check that the renderer is adding the widget
		placeholder.set('currentChild', widget);
		assert.deepEqual(placeholder.get('children'), [ widget ], 'Widget should be only child of placeholder');

		// setting a null child should empty the widget
		placeholder.set('currentChild', null);
		assert.deepEqual(placeholder.get('children'), [], 'Widget should be empty');
	}
});
