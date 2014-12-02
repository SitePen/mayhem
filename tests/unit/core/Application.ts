/// <reference path="../../../dojo" />
/// <reference path="../../intern" />

import Application = require('../../../Application');
import aspect = require('dojo/aspect');
import assert = require('intern/chai!assert');
import LogLevel = require('../../../LogLevel');
import registerSuite = require('intern!object');

var app:Application;

registerSuite({
	name: 'mayhem/Application',

	afterEach() {
		app && app.destroy();
	},

	'#run'() {
		app = new Application();
		var runPromise = app.run();

		return runPromise.then(function () {
			assert.strictEqual(app.run(), runPromise, 'app.run should return the same promise each call');
		});
	},

	'#handleError': {
		'with errorHandler'() {
			var receivedError:Error;

			app = new Application({
				errorHandler: {
					handleError(error:Error) {
						receivedError = error;
					}
				},
				components: {
					errorHandler: null
				}
			});

			return app.run().then(function () {
				var testError = new Error('test');

				app.handleError(testError);
				assert.strictEqual(receivedError, testError, 'error handler should receive passed Error object');

				// TODO: remove this cleanup when Application is fixed
				// https://github.com/SitePen/mayhem/issues/14
				var defaultConfig = Application._defaultConfig;
				// TS7017
				(<any> defaultConfig)['errorHandler'] = null;
			});
		},

		'without errorHandler'() {
			var loggedLevel:number;

			// TODO: remove this cleanup when Application is fixed
			// https://github.com/SitePen/mayhem/issues/14
			var defaultConfig = Application._defaultConfig;
			// TS7017
			(<any> defaultConfig)['errorHandler'] = null;

			app = new Application({
				logger: {
					log(message:string, level:number, category:string):void {
						loggedLevel = level;
					}
				},
				components: {
					errorHandler: null,
					logger: null
				}
			});

			return app.run().then(function () {
				app.handleError(new Error('test error'));
				assert.strictEqual(loggedLevel, LogLevel.ERROR, 'logger.log should be called with correct LogLevel');

				// TODO: remove this cleanup when Application is fixed
				// https://github.com/SitePen/mayhem/issues/14
				var defaultConfig = Application._defaultConfig;
				// TS7017
				(<any> defaultConfig)['logger'] = null;
			});
		}
	},

	'#log': {
		'with logger'() {
			var receivedArguments:any[];

			app = new Application({
				logger: {
					log(message:string, level:number, category:string):void {
						receivedArguments = Array.prototype.slice.call(arguments);
					}
				},
				components: {
					errorHandler: null,
					logger: null
				}
			});

			return app.run().then(function () {
				var logArguments = [ 'test message', LogLevel.LOG, 'test category'];

				app.log.apply(app, logArguments);
				assert.deepEqual(receivedArguments, logArguments, 'logger.log should be called with correct arguments');

				// TODO: remove this cleanup when Application is fixed
				// https://github.com/SitePen/mayhem/issues/14
				var defaultConfig = Application._defaultConfig;
				// TS7017
				(<any> defaultConfig)['logger'] = null;
			});
		},

		'without logger'() {
			// TODO: remove this cleanup when Application is fixed
			// https://github.com/SitePen/mayhem/issues/14
			var defaultConfig = Application._defaultConfig;
			// TS7017
			(<any> defaultConfig)['logger'] = null;

			app = new Application({
				components: {
					logger: null
				}
			});

			return app.run().then(function () {
				var testMessage = 'test message';
				var logMessage:string;
				var handle:IHandle;

				[ 'ERROR', 'WARN', 'LOG', 'INFO', 'DEBUG' ].forEach(function (logLevel) {
					var methodName = logLevel.toLowerCase();

					handle = aspect.before(console, methodName, function () {
						logMessage = arguments[0];
					});

					// TS7017
					app.log(testMessage, (<any> LogLevel)[logLevel]);

					assert.include(logMessage, testMessage,
						'console.' + methodName + ' should be called with correct arguments');

					handle.remove();
					logMessage = '';
				});
			});
		}
	}
});
