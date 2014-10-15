/// <reference path="../../intern" />
import aspect = require('dojo/aspect');
import Application = require('../../../Application');
import assert = require('intern/chai!assert');
import ErrorHandler = require('../../../ErrorHandler');
import has = require('../../../has');
import Observable = require('../../../Observable');
import on = require('dojo/on');
import registerSuite = require('intern!object');

declare var window:any;

var application;
var errorHandler;
var defaultView:string = 'currentView';
var errorMessage:string = 'Mayhem Error Message';
var handle:any;
var ui:any;

interface IMockUi {
	_view:any;
}

class MockUi extends Observable implements IMockUi {
	_view:any;
	constructor() {
		super();
	}
}

registerSuite({
	name: 'mayhem/ErrorHandler',
	afterEach() {
		errorHandler.destroy();
		handle && handle.remove();
		handle = null;
	},

	before() {
		application = new Application({
			components: {
				ui: {
					constructor: MockUi
				}
			}
		});
		return application.startup();
	},

	beforeEach() {
		errorHandler = new ErrorHandler({
			app: application
		});
		ui = errorHandler._app.get('ui');
		ui.set('view', defaultView);
		return errorHandler.startup();
	},

	'assert default properties'() {
		assert.isTrue(errorHandler._handleGlobalErrors);
		assert.strictEqual(ui._view, defaultView, 'ui view is equal to default view');
		assert.isUndefined(ui.get('view').model, 'model is undefined');
	},

	'assert startup handles errors'() {
		if (has('host-browser')) {
			var dfd = this.async();
			handle = on(window, 'error', dfd.callback(function (event) {
				event.preventDefault();
				assert.include(ui.get('view').get('model').message, errorMessage, 'includes error message');
			}));

			setTimeout(function () {
				throw new Error(errorMessage);
			}, 0);
		}
	},

	'assert handling of errors in DOM'() {
		if (has('host-browser')) {
			errorHandler.handleDomError(new Error(errorMessage));
			assert.isDefined(ui.get('view').get('model'), 'model is defined');
			assert.strictEqual(ui.get('view').get('model').message, errorMessage, 'error message is equal to default');
		}
	},

	'assert handling of errors in Node'() {
		if (has('host-node')) {
			handle = aspect.before(errorHandler._app, 'log', function () {
				var message = String(arguments[0]);
				assert.include(message, errorMessage, 'includes error message');
			});
			errorHandler.handleNodeError(new Error(errorMessage));
		}
	}
});
