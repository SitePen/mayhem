/// <reference path="../../intern" />

import Application = require('../../../Application');
import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');

var app:Application;

registerSuite({
	name: 'mayhem/Application',

	afterEach() {
		app && app.destroy();
	},

	'#run'() {
		app = new Application({
			components: {
				errorHandler: null
			}
		});
		var runPromise = app.run();

		return runPromise.then(function () {
			assert.strictEqual(app.run(), runPromise, 'app.run should return the same promise each call');
		});
	},

	'#log'() {
		var testMessage = 'test message';
		var logCalled = false;

		app = new Application({
			logger: {
				log: function (message:string, level:number, category:string):void {
					logCalled = true;
					assert.strictEqual(message, testMessage)
				}
			},
			components: {
				errorHandler: null,
				logger: null
			}
		});

		return app.run().then(function () {
			app.log(testMessage);
			assert.isTrue(logCalled, 'logger.log should be called');
		});
	}
});
