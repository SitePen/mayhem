/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Conditional = require('../../ui/Conditional');
import ContentView = require('../../ui/ContentView');
import Widget = require('../../ui/Widget');
import aspect = require('dojo/aspect');
import MockRenderer = require('../mocks/ui/Renderer');
import util = require('./util');
import Deferred = require('dojo/Deferred');
import MockApplication = require('../mocks/Application');

var conditional:Conditional,
	conditionalRenderer:any = Conditional.prototype._renderer,
	contentViewRenderer:any = ContentView.prototype._renderer;

function createView() {
	return {
		destroyed: false,
		destroy() {
			this.destroyed = true;
		},
		set(key:string, value:any) {
			this[key] = value;
		}
	};
}

registerSuite({
	name: 'ui/Conditional',

	setup: function () {
		Conditional.prototype._renderer = <any> new MockRenderer();
		ContentView.prototype._renderer = <any> new MockRenderer();
		Widget.prototype._renderer = <any> new MockRenderer();
	},

	teardown: function () {
		Conditional.prototype._renderer = conditionalRenderer;
		ContentView.prototype._renderer = contentViewRenderer;
		Widget.prototype._renderer = undefined;
	},

	beforeEach: function () {
		conditional = new Conditional();
	},

	afterEach: function () {
		if (conditional) {
			try {
				conditional.destroy();
			} catch (e) {
				// ignore
			}
			conditional = null;
		}
	},

	'#add': function () {
		var widget:any = new Widget(),
			consequent = conditional.get('consequent'),
			added:any, addedWidget:any;

		aspect.before(consequent, 'add', function (widget:any) {
			added = true;
			addedWidget = widget;
		});

		conditional.add(widget);
		assert.isTrue(added, 'Consequent add should have been called once');
		assert.strictEqual(addedWidget, widget, 'Widget should have been added to consequent');
	},

	'#destroy': function () {
		var alternate = new Widget(),
			destroyed = false;
		aspect.after(alternate, 'destroy', function () {
			destroyed = true;
		});
		conditional.set('alternate', alternate);
		conditional.destroy();
		assert.isTrue(destroyed, 'Alternate should have been destroyed');
		conditional = null;
	},

	'#setContent': function () {
		var widget = new Widget(),
			consequent:any = conditional.get('consequent');
		conditional.setContent(widget);
		assert.strictEqual(consequent._renderer._content, widget, 'Consequent content should be widget');
	},

	// 'alternate observer': function () {
	// 	var consequent = conditional.get('consequent'),
	// 		alternate1:any = createView(),
	// 		alternate2:any = createView(),
	// 		widgetChanged = false;

	// 	conditional.observe('widget', function (newWidget:any) {
	// 		widgetChanged = true;
	// 	});

	// 	conditional.set('alternate', alternate1);
	// 	assert.strictEqual(alternate1.parent, conditional, 'Conditional should be parent of alternate1');

	// 	conditional.set('result', 'foo');
	// 	conditional.set('alternate', alternate2);
	// 	assert.strictEqual(alternate2.parent, conditional, 'Conditional should be parent of alternate2');
	// 	assert.isTrue(alternate1.destroyed, 'Alternate1 should have been destroyed');
	// 	assert.isTrue(widgetChanged, 'Widget should have been set');
	// 	// TODO: check that widget is set based on result
	// },

	// 'condition observer': function () {
	// 	var app = new MockApplication(),
	// 		binder = app._properties.binder;

	// 	conditional.set('app', app);
	// 	conditional.set('mediator', {});
	// 	conditional.set('condition', 'foo');
	// 	assert.deepPropertyVal(binder, '_bindArgs.sourceBinding', 'foo',
	// 		'Binding should have been created for condition');
	// }
});
