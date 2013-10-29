/// <reference path="../intern.d.ts" />

import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import Es3DataBindingRegistry = require('../../binding/Es3DataBindingRegistry');

var registry:Es3DataBindingRegistry;

registerSuite({
	name: 'Es3DataBindingRegistry',

	setup: function () {
		registry = new Es3DataBindingRegistry();
	},

	teardown: function () {
		registry: null;
	},

	'basic tests': function () {
	}
});
