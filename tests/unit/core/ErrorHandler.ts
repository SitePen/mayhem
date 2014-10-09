/// <reference path="../../intern" />
import assert = require('intern/chai!assert');
import ErrorHandler = require('../../../ErrorHandler');
import Observable = require('../../../Observable');
import registerSuite = require('intern!object');

class MockApplication extends Observable {
    _ui:any;
    view: any;
}

declare var errorHandler;

registerSuite({
    name: 'mayhem/ErrorHandler',
    afterEach() {
        errorHandler.destroy();
    },

    beforeEach() {
        errorHandler = new ErrorHandler({
            app: new MockApplication()
        });
        errorHandler.startup();
    },

    'assert default properties'() {
        assert.isTrue(errorHandler._handleGlobalErrors);
    },

    'assert startup handles errors'() {

    },

    'assert handling of errors in DOM'() {
        // ...
    },

    'assert handling of errors in Node'() {
        // ...
    }
});
