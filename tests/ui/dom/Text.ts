/// <reference path="../../../dojo" />
/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import TextRenderer = require('../../../ui/dom/Text');
import util = require('../support/util');
import Widget = require('../../../ui/Widget');

var renderer:any, widget:any;

registerSuite({
	name: 'ui/dom/Text',

	setup() {
		Widget.prototype._renderer = new TextRenderer();
	},

	teardown() {
		Widget.prototype._renderer = undefined;
	},

	beforeEach() {
		widget = new Widget();
		renderer = new TextRenderer();
	},

	afterEach() {
		widget = util.destroy(widget);
		renderer = null;
	},

	'setContent'() { 
		widget._firstNode = {
			innerHTML: '<span>foo</span>',
			textContent: 'foo'
		};
		widget._outerFragment = {}

		renderer.setContent(widget, 'bar');
		assert.strictEqual(widget.get('formattedText'), '<span>foo</span>');
		assert.strictEqual(widget.get('text'), 'foo');

		widget._firstNode.textContent = null;
		widget._firstNode.innerText = 'baz';
		renderer.setContent(widget, 'bar');
		assert.strictEqual(widget.get('text'), 'baz');
	}
});
