/// <reference path="../intern.d.ts" />

import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import util = require('./util');
import PropertyRegistry = require('../../binding/PropertyRegistry');

var app:IApplication,
	registry:PropertyRegistry;

registerSuite({
	name: 'PropertyRegistry',

	setup: function () {
		registry = util.createPropertyRegistry();
	},

	teardown: function () {
		app = registry = null;
	},

	'basic tests': function () {
		// TODO: Mock Property binders to test add, createProperty, test, bind
	}
});
