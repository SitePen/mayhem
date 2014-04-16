/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Conditional = require('../../ui/Conditional');
import ContentView = require('../../ui/ContentView');
import aspect = require('dojo/aspect');
import Widget = require('../mocks/ui/Widget');
import MockApplication = require('../mocks/Application');
import MockRenderer = require('../mocks/ui/Renderer');

var conditional:Conditional,
	conditionalRenderer:any = Conditional.prototype._renderer,
	contentViewRenderer:any = ContentView.prototype._renderer;

registerSuite({
	name: 'ui/Conditional',

	setup() {
		Conditional.prototype._renderer = new MockRenderer();
		ContentView.prototype._renderer = new MockRenderer();
	},

	teardown() {
		Conditional.prototype._renderer = conditionalRenderer;
		ContentView.prototype._renderer = contentViewRenderer;
	},

	beforeEach() {
		conditional = new Conditional();
	},

	afterEach() {
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
			addedWidget:any;

		aspect.before(consequent, 'add', function (widget:any) {
			addedWidget = widget;
		});

		conditional.add(widget);
		assert.strictEqual(addedWidget, widget, 'Widget should have been added to consequent');
	},

	'#setContent': function () {
		var widget = new Widget(),
			consequent:any = conditional.get('consequent'),
			content:any;
		aspect.before(consequent, 'setContent', function (w:any) {
			content = w;
		});
		conditional.setContent(widget);
		assert.strictEqual(content, widget, 'Consequent content should have been set to be widget');
	},

	'#remove': function () {
		var widget = new Widget(),
			view = conditional.get('consequent'),
			removed:any;
		aspect.before(view, 'remove', function (item:any) {
			removed = item;
		});
		conditional.add(widget);
		conditional.remove(widget);
		assert.strictEqual(removed, widget, 'Widget should have been removed from consequent view');

		conditional.remove(view);
		assert.strictEqual(conditional.getChildIndex(view), -1, 'success view should not be a child of widget');
	},

	'alternate observer': function () {
		var placed:any,
			widget = new Widget();
		aspect.before(conditional, '_placeView', function (w:any) {
			placed = w;
		});
		conditional.set('alternate', widget);
		assert.strictEqual(placed, widget, 'Widget should have been placed');
	},

	'consequent observer': function () {
		var placed:any,
			widget = new Widget();
		aspect.before(conditional, '_placeView', function (w:any) {
			placed = w;
		});
		conditional.set('consequent', widget);
		assert.strictEqual(placed, widget, 'Widget should have been placed');
	},

	'condition observer': function () {
		var sourceBinding:any;
		aspect.before(conditional, 'bind', function (kwArgs:any) {
			sourceBinding = kwArgs.sourceBinding;
		});

		conditional.set('condition', 'foo');
		assert.strictEqual(sourceBinding, 'foo', 'Binding should have been created for foo');
	},

	'result observer': function () {
		var consequentVisible = false,
			alternateVisible = false,
			alternate = new Widget();
		aspect.before(conditional.get('consequent'), 'set', function (key:string, value:any) {
			if (key === 'hidden') {
				consequentVisible = !value;
			}
		});
		aspect.before(alternate, 'set', function (key:string, value:any) {
			if (key === 'hidden') {
				alternateVisible = !value;
			}
		});
		conditional.set('alternate', alternate);
		conditional.set('result', 'foo');
		assert.isDefined(consequentVisible, 'Consequent visibility should have been set');
		assert.isDefined(alternateVisible, 'Alternate visibility should have been set');
	}
});
