/// <reference path="../../../dojo" />
/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import TextRenderer = require('../../../ui/dom/Text');
import util = require('../support/util');
import Widget = require('../../../ui/Widget');
import aspect = require('dojo/aspect');

var renderer:any, widget:any;

registerSuite({
	name: 'ui/dom/Text',

	setup():void {
		Widget.prototype._renderer = new TextRenderer();
	},

	teardown():void {
		Widget.prototype._renderer = undefined;
	},

	beforeEach():void {
		widget = new Widget();
		renderer = widget._renderer;
	},

	afterEach():void {
		widget = util.destroy(widget);
		renderer = null;
	},

	'#initialize': function ():void {
		var setText:string;

		renderer.initialize(widget);

		aspect.before(widget, 'setContent', function (content:string):void {
			setText = content;
		});

		widget.set('formattedText', 'test');
		assert.strictEqual(setText, 'test');

		widget.set('text', '&test');
		assert.strictEqual(setText, '&amp;test');
	},

	'#setContent': function ():void {
		widget._firstNode = {
			innerHTML: '<span>foo</span>',
			textContent: 'foo'
		};
		widget._outerFragment = {};

		renderer.setContent(widget, 'bar');
		assert.strictEqual(widget.get('formattedText'), '<span>foo</span>');
		assert.strictEqual(widget.get('text'), 'foo');

		widget._firstNode.textContent = null;
		widget._firstNode.innerText = 'baz';
		renderer.setContent(widget, 'bar');
		assert.strictEqual(widget.get('text'), 'baz');
	}
});
