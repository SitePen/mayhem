/// <reference path="../../intern" />
import assert = require('intern/chai!assert');
import Application = require('../../../Application');
import ErrorHandler = require('../../../ErrorHandler');
import Observable = require('../../../Observable');
import registerSuite = require('intern!object');

declare var application;
declare var errorHandler;

interface IMockUi {
    _view:any;
}

class MockUi extends Observable implements IMockUi {
    _view:any;
    constructor() {
        super();
        this._view = 'ui';
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
                ui: new MockUi()
            }
        });
        application.startup();
    },

    beforeEach() {
        errorHandler = new ErrorHandler({
            app: application
        });
        errorHandler.startup();
    },

    'assert default properties'() {
        assert.isTrue(errorHandler._handleGlobalErrors);
    },

    'assert startup handles errors'() {

    },

    'assert handling of errors in DOM'() {
        setTimeout(function () {
            throw new Error();
        }, 0);
    },

    'assert handling of errors in Node'() {
        // ...
    }
});
