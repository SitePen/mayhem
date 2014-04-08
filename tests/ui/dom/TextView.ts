/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import registerSuite = require('intern!object');
import TextView = require('../../../ui/dom/TextView');
import Widget = require('../../../ui/Widget');
import MockRenderer = require('../../mocks/ui/Renderer');
import Observable = require('../../../Observable');
import util = require('../util');

var renderer:any;

registerSuite({
	name: 'ui/dom/TextView',

	setup() {
		Widget.prototype._renderer = new MockRenderer();
	},

	teardown() {
		Widget.prototype._renderer = undefined;
	},

	beforeEach() {
		renderer = new TextView();
	},

	afterEach() {
		renderer = util.destroy(renderer);
	},

	'render'() {
		var widget:any = new Widget(),
			content:any,
			contentValue:any;

		aspect.before(renderer, 'setContent', function (widget:any, value:any) {
			content = widget;
			contentValue = value;
		});

		renderer.render(widget);
		widget.set('formattedText', 'foo');
		assert.strictEqual(content, widget, 'content should have been set on widget');
		assert.strictEqual(contentValue, 'foo');

		widget.set('text', 'bar&');
		assert.strictEqual(content, widget, 'content should have been set on widget');
		assert.strictEqual(contentValue, 'bar&amp;');
	},

	'setContent'() { 
		var widget:any = new Observable();
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
