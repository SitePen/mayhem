/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import ui = require('../../ui/interfaces');
import ContentView = require('../../ui/ContentView');
import Widget = require('../../ui/Widget');
import MockRenderer = require('../mocks/ui/Renderer');

var view:ContentView,
	contentViewRenderer:any = ContentView.prototype._renderer;

registerSuite({
	name: 'ui/ContentView',

	setup() {
		Widget.prototype._renderer = <any> new MockRenderer();
		ContentView.prototype._renderer = <any> new MockRenderer();
	},

	teardown() {
		Widget.prototype._renderer = undefined;
		ContentView.prototype._renderer = contentViewRenderer;
	},

	beforeEach() {
		view = new ContentView();
	},

	afterEach() {
		if (view) {
			try {
				view.destroy();
			} catch (e) {
				// ignore
			}
			view = null;
		}
	},

	'constructor'() {
		assert.isDefined(view.placeholders, 'Placeholders object should be defined');
	},

	'#add'() {
		var widget:any = new Widget(),
			parent:any = {
				children: [],
				add(child:any) {
					this.children.push(child);
				},
				get(key:string) {
					return this[key];
				},
				observe() {}
			},
			placeholder:any = {
				set(key:string, value:any) {
					this[key] = value;
				},
				empty() {},
				destroy() {}
			};

		// add the mock placeholders and parent
		view.placeholders['foo'] = placeholder;
		parent.children.push(view);
		view.set('parent', parent);

		// add widget to view
		view.add(widget);
		assert.sameMembers(view.get('children'), [widget], 'Widget should be only child of view');

		// add widget at specific placeholder
		var handle = view.add(widget, 'foo');
		assert.propertyVal(placeholder, 'currentChild', widget, 'Widget should be assigned to placeholder');

		// adding a widget with a null placeholder should throw
		view.placeholders = {};
		assert.throws(() => view.add(widget, 'foo'), Error, /.*/,
			'Adding widget to named position with no matching placeholder should throw');

		handle.remove();
		assert.doesNotThrow(() => handle.remove(), 'Removing handle a second time should not throw');
	},

	'#clear'() {
		var cleared = false;
		view.clear();
		assert.deepPropertyVal(view._renderer, 'callCounts.clear', 1, 'ContentView should have cleared its renderer');
	},

	'#destroy'() {
		var	placeholder:any = {
				_emptyCount: 0,
				_destroyCount: 0,
				set(key:string, value:any) {
					this[key] = value;
				},
				empty() {
					this._emptyCount++;
				},
				destroy() {
					this._destroyCount++;
				}
			};
		// add the mock placeholders and parent
		view.placeholders['foo'] = placeholder;
		view.destroy();
		assert.strictEqual(placeholder._emptyCount, 1, 'Placeholder should have been emptied once');
		assert.strictEqual(placeholder._destroyCount, 1, 'Placeholder should have been destroyed once');
		view = null;
	},

	'#_contentSetter'() {
		var widget = {};
		view.setContent(widget);
		assert.deepPropertyVal(view._renderer, 'callCounts.setContent', 1, 'setContent should have been called once');
		assert.propertyVal(view._renderer, '_content', widget, 'Content should have been set to test widget');
	}
});
