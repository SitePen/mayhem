/// <reference path="../../../dojo" />
/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import Iterator = require('../../../ui/Iterator');
import Memory = require('dojo/store/Memory');
import Observable = require('../../../Observable');
import ObservableArray = require('../../../ObservableArray');
import registerSuite = require('intern!object');
import ui = require('../../../ui/interfaces');
import util = require('../support/util');
import Widget = require('../../mocks/ui/Widget');
import WidgetFactory = require('../../../templating/WidgetFactory');

var iterator:any,
	renderer:any;

registerSuite({
	name: 'ui/dom/Iterator',

	beforeEach() {
		iterator = new Iterator()
		renderer = iterator._renderer;
	},

	afterEach() {
		iterator = util.destroy(iterator);
	},

	'#destroy'() {
		var destroyed = false,
			widget:any = {
				_impl: { destroy() { destroyed = true; } }
			}
		assert.doesNotThrow(function () {
			renderer.destroy(widget);
		}, 'Destroying renderer should not throw');
		assert.isTrue(destroyed, 'Widget should have been destroyed');
		assert.isNull(widget._impl, 'Widget list implementation should be null');
	},
});
