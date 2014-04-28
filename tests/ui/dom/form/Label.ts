/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import LabelRenderer = require('../../../../ui/dom/form/Label');
import Widget = require('../../../../ui/Widget');

registerSuite({
	name: 'ui/dom/form/Label',

	setup() {
		Widget.prototype._renderer = new LabelRenderer();
	},

	teardown() {
		Widget.prototype._renderer = undefined;
	},

	render() {
		var renderer = new LabelRenderer(),
			widget:any = new Widget(),
			attribute:any;

		renderer.render(widget);
		widget.set('for', 'foo');
		assert.strictEqual(widget._firstNode.getAttribute('for'), 'foo',
			'Widget node should have "for" attribute with value "foo"');
	}
});
