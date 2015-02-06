import Application = require('mayhem/Application');
import arrayUtil = require('dojo/_base/array');
import assert = require('intern/chai!assert');
import has = require('mayhem/has');
import LogLevel = require('mayhem/LogLevel');
import registerSuite = require('intern!object');

var app:Application;

registerSuite({
	name: 'mayhem/Application',

	afterEach() {
		app && app.destroy();
	},

	'#run': {
		simple() {
			app = new Application();
			var runPromise = app.run();

			return runPromise.then(function (result) {
				assert.strictEqual(result, app, 'app.run should resolve to the application instance');
				assert.strictEqual(app.run(), runPromise, 'app.run should return the same promise each call');
			}, function (error) {
				throw error;
			});
		},

		'with bad component module id'() {
			if (has('host-node')) {
				this.skip('require does not emit an error when loading a bad mid in Node.js');
			}

			// This test sometimes times out, so give it a long timeout value
			var dfd = this.async(10000);

			app = new Application({
				components: {
					test: {
						// TODO: require is broken and only throws an error on the first request for a mid that returns
						// a 404
						// For now, ensure that you don't reuse invalid mids in tests
						constructor: 'App1/bad/module/id'
					}
				}
			});

			app.run().then(function () {
				dfd.reject(new Error('app.run should reject when passed a bad module id'));
			}, function () {
				dfd.resolve();
			});
		}
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
			});
		},

		'without errorHandler'() {
			var loggedLevel:number;

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
			});
		},

		'without logger'() {
			if (typeof console === 'undefined') {
				this.skip('Test requires console object');
			}

			app = new Application({
				components: {
					logger: null
				}
			});

			return app.run().then(function () {
				var testMessage = 'test message';
				var logMessage:any;

				arrayUtil.forEach([ 'ERROR', 'WARN', 'LOG', 'INFO', 'DEBUG' ], function (logLevel) {
					var methodName = logLevel.toLowerCase();
					var originalMethod = (<any> console)[methodName];

					// dojo/aspect does not work on console methods in IE8
					(<any> console)[methodName] = function (message:any) {
						logMessage = message;
					};

					try {
						// TS7017
						app.log(testMessage, (<any> LogLevel)[logLevel]);

						assert.include(logMessage, testMessage,
							'console.' + methodName + ' should be called with correct arguments');
					}
					finally {
						(<any> console)[methodName] = originalMethod;
						logMessage = '';
					}
				});
			});
		}
	}
});
