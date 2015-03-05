import Application = require('mayhem/Application');
import aspect = require('dojo/aspect');
import assert = require('intern/chai!assert');
import ErrorHandler = require('mayhem/ErrorHandler');
import has = require('mayhem/has');
import MockWebApplication = require('../../support/MockWebApplication');
import registerSuite = require('intern!object');

var app: MockWebApplication;
var errorHandler: ErrorHandler;
var handle: IHandle;
var globalListener: any;

declare var process: any;

registerSuite({
	name: 'mayhem/ErrorHandler',

	before() {
		// Intern introduces its own global error handler that we need to disable to test that the global error handling
		// in Mayhem is working
		if (has('host-browser')) {
			globalListener = window.onerror;
			window.onerror = null;

			app = new MockWebApplication({
				components: {
					errorHandler: null,
					logger: null
				}
			});
		}
		else if (has('host-node')) {
			globalListener = process._events.uncaughtException;
			delete process._events.uncaughtException;

			app = <MockWebApplication> new Application({
				components: {
					errorHandler: null,
					logger: null
				}
			});
		}

		return app.run();
	},

	beforeEach() {
		errorHandler = new ErrorHandler({
			app
		});
		return errorHandler.run();
	},

	afterEach() {
		errorHandler.destroy();
		handle && handle.remove();
		handle = null;
	},

	after() {
		if (has('host-browser')) {
			window.onerror = globalListener;
		}
		else if (has('host-node')) {
			process._events.uncaughtException = globalListener;
		}
	},

	'defaults'() {
		assert.isTrue(errorHandler.handleGlobalErrors);

		if (has('host-browser')) {
			assert.notOk(app.ui.get('view'));
		}
	},

	'#handleGlobalErrors'() {
		var dfd = this.async(500);
		var expected = new Error('Oops');

		errorHandler.handleError = dfd.callback(function (actual: Error) {
			assert.strictEqual(actual.message, expected.message);
		});

		setTimeout(function () {
			throw expected;
		}, 0);
	},

	'#handleError'() {
		if (has('host-node')) {
			var loggedMessage: string;
			handle = aspect.before(app, 'log', function (message: string) {
				loggedMessage = message;
			});
		}

		errorHandler.handleError(new Error('Oops'));

		if (has('host-browser')) {
			assert.ok(app.ui.get('view'), 'Uncaught error should cause the UI view to change to the error view');
			assert.instanceOf(app.ui.get('view').get('model'), Error,
				'The uncaught error should be set as the model for the view');
			assert.strictEqual((<Error> app.ui.get('view').get('model')).message, 'Oops');
		}
		else if (has('host-node')) {
			assert.include(loggedMessage, 'Oops');
		}
	}
});
