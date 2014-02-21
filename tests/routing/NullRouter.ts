/// <reference path="../intern" />

import Route = require('../../routing/Route');
import NullRouter = require('../../routing/NullRouter');
import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');

var router:NullRouter;

registerSuite({
	name: 'NullRouter',

	beforeEach: function () {
		router = new NullRouter();
	},

	'#startup': function () {
		function handleChangeEvent (event:Event):void {
			changeHappened = true;
		}

		var changeHappened = false;

		router.on('change', handleChangeEvent);
		router.startup();
		assert.isTrue(changeHappened, 'change event handler should be called at startup');
	},

	'#pause': function () {
		router.pause();
		assert.isTrue(router.paused, 'NullRouter should be paused after a call to pause');
	},

	'#resume': function () {
		router.resume();
		assert.isFalse(router.paused, 'NullRouter should not be paused after a call to resume');
	},

	'#go': function () {
		function handleChangeEvent (event:Event):void {
			changeHappened = true;
		}

		var changeHappened = false;
		router.on('change', handleChangeEvent);

		router.go('index');
		assert.isTrue(changeHappened, 'change event handler should be called');
		assert.equal(router.get('oldPath'), '{"id":"index"}', 'oldPath should be updated');

		router.pause();
		assert.throws(
			function () { router.go('index'); }, 
			Error,
			null,
			'calling go on a paused router should throw'
		);
	},

	'#createPath': function () {
		assert.equal(router.createPath('index'), '{"id":"index"}', 'created path should have proper format');
	},

	'#resetPath': function () {
		router.resetPath('index');
		assert.isUndefined(router.get('oldPath'), 'oldPath should be undefined');

		router.resetPath('index', true);
		assert.equal(router.get('oldPath'), 'index', 'oldPath should be set to the expected value');
	}
});
