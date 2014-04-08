/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import LabelRenderer = require('../../../../ui/dom/form/Label');
import Observable = require('../../../../Observable');

registerSuite({
	name: 'ui/dom/form/Label',

	render() {
		var renderer = new LabelRenderer(),
			widget:any = new Observable(),
			attribute:any;

		renderer.render(widget);
		widget.set('for', 'foo');
		assert.strictEqual(widget._firstNode.getAttribute('for'), 'foo',
			'Widget node should have "for" attribute with value "foo"');
	}
});
