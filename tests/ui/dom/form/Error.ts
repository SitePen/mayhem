/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import registerSuite = require('intern!object');
import ErrorRenderer = require('../../../../ui/dom/form/Error');
import Error = require('../../../../ui/form/Error');
import ObservableArray = require('../../../../ObservableArray');

var renderer:any;

registerSuite({
	name: 'ui/dom/form/Error',

	beforeEach() {
		renderer = new ErrorRenderer();
	},

	afterEach() {
		renderer = null;
	},

	'#destroy'() {
		var widget:any = new Error(),
			removed = false;
		widget._observerHandle = {
			remove() { removed = true; }
		}
		renderer.destroy(widget);
		assert.isTrue(removed, 'Observer handle should have been removed');
	},

	'#initialize'() {
		var widget:any = new Error(),
			removed = false,
			cleared:any,
			rendered:any;

		aspect.before(renderer, '_renderList', function (widget:any) {
			rendered = widget;
		});

		aspect.before(renderer, 'clear', function (widget:any) {
			cleared = widget;
		});

		renderer.initialize(widget);

		widget.set('list', [ {} ]);
		assert.strictEqual(rendered, widget, 'widget should have been rendered');

		var array = new ObservableArray();
		widget._observerHandle = null;
		widget.set('list', array);
		assert.isNotNull(widget._observerHandle, 'Observer handle should have beens set');

		rendered = null;
		array.push(5);
		assert.strictEqual(rendered, widget, 'widget should have been rendered');

		widget.set('list', null);
		assert.strictEqual(cleared, widget, 'widget should have been cleared');
	}
});
