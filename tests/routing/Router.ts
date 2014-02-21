/// <reference path="../intern" />

import Route = require('../../routing/Route');
import Router = require('../../routing/Router');
import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');

registerSuite({
	name: 'Router',

	'initialize with string route': function () {
		var router = new Router({ routes: { 'sprockets': '/sprockets' } }),
			routes = router.get('routes');
		assert.property(routes, 'sprockets')
	},

	'initialize with Route': function () {
		var router = new Router({ routes: { 'sprockets': new Route() } }),
			routes = router.get('routes');
		assert.property(routes, 'sprockets')
	},

	'#normalizeId': function () {
		var router = new Router(),
			id:string;

		id = router.normalizeId('index');
		assert.equal(id, 'index');

		id = router.normalizeId('sprockets/1');
		assert.equal(id, 'sprockets/1');
	}
});
