/// <reference path="../intern" />

import MockRouter = require('./MockRouter');
import RouteEvent = require('../../routing/RouteEvent');
import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');

var event:RouteEvent;
var router:MockRouter;

registerSuite({
	name: 'RouteEvent',

	beforeEach: function () {
		router = new MockRouter();
		event = new RouteEvent({
			cancelable: true,
			pausable: true,
			oldPath: '/old',
			newPath: '/new',
			router: router
		});
	},

	'#pause': function () {
		event.pause();
		assert.equal(router.path, event.oldPath, 'pausing an event should set the router path to the old path');
	},

	'#resume': function () {
		event.resume();
		assert.equal(router.path, event.newPath, 'resuming an event should set the router path to the new path');
	},

	'#cancel': function () {
		event.cancel();
		assert.isTrue(event.canceled, 'canceling an event should set its cancel flag');
	},

	'#preventDefault': function () {
		event.pause();
		assert.equal(router.path, event.oldPath, 'preventDefault should set the router path to the old path');
	}
});
