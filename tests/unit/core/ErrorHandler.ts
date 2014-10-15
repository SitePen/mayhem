/// <reference path="../../intern" />
import assert = require('intern/chai!assert');
import Application = require('../../../Application');
import ErrorHandler = require('../../../ErrorHandler');
import Observable = require('../../../Observable');
import registerSuite = require('intern!object');

var application;
var errorHandler;
var defaultView:string = 'currentView';
var errorMessage:string = 'Mayhem Error Message';
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
		var dfd = this.async(1000);

		window.addEventListener('error', function (event) {
			event.preventDefault();
		}, false);

		setTimeout(function () {
			throw new Error(errorMessage);
		}, 0);

		ui.observe('view', dfd.callback(function (newValue) {
			assert.isObject(newValue);
			assert.include(ui.get('view').get('model').message, errorMessage, 'includes error message');
		}));
	},

	'assert handling of errors in DOM'() {
		errorHandler.handleDomError(new Error(errorMessage));
		assert.isDefined(ui.get('view').get('model'), 'model is defined');
		assert.strictEqual(ui.get('view').get('model').message, errorMessage, 'error message is equal to default');
	},

	'assert handling of errors in Node'() {
		// ...
	}
});
