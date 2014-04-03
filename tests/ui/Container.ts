/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Container = require('../../ui/Container');
import Widget = require('../../ui/Widget');
import AddPosition = require('../../ui/AddPosition');
import PlacePosition = require('../../ui/PlacePosition');
import ui = require('../../ui/interfaces');
import MockRenderer = require('../mocks/ui/Renderer');
import Deferred = require('dojo/Deferred');
import util = require('./util');

var container:Container;

registerSuite({
	name: 'ui/Container',

	setup: function () {
		Widget.prototype._renderer = <any> new MockRenderer();
	},

	teardown: function () {
		Widget.prototype._renderer = undefined;
	},

	beforeEach: function () {
		container = new Container();
	},

	afterEach: function () {
		if (container) {
			try {
				container.destroy();
			} catch (e) {
				// ignore
			}
			container = null;
		}
	},

	'#add': function () {
		var widget = new Widget(),
			parent:any = {
				children: [],
				add(child:any, index?:number) {
					if (typeof index === 'undefined') {
						index = this.children.length;
					}
					this.children.splice(index, 0, child);
				},
				get(key:string) {
					return this[key];
				},
				observe() {},
				getChildIndex(widget:any) {
					return this.children.indexOf(widget);
				}
			};

		// add widget to container
		var handle = container.add(widget);
		widget.set('index', 0);
		assert.sameMembers(container.get('children'), [widget], 'Widget should be only child of container');

		handle.remove();
		assert.doesNotThrow(function () {
			handle.remove();
		}, 'Removing handle a second time should not throw');

		parent.children = [container];
		container.set('parent', parent);

		container.add(widget);
		assert.deepEqual(container.get('children'), [widget], 'widget should be the only child in the container');

		var widget2:any = new Widget();
		container.add(widget2, AddPosition.FIRST);
		assert.deepEqual(container.get('children'), [ widget2, widget ], 'widget2 should be the first child in the container');
		assert.strictEqual(widget2.get('parent'), container, 'container should be parent of widget2');

		var widget3:any = new Widget();
		container.add(widget3, AddPosition.LAST);
		assert.deepEqual(container.get('children'), [ widget2, widget, widget3 ],
			'widget5 should be the last child in the container');

		var widget4:any = new Widget();
		container.add(widget4, PlacePosition.ONLY);
		assert.deepEqual(container.get('children'), [ widget4 ], 'widget4 should be the only child in the container');

		var widget5:any = new Widget();
		container.add(widget5, PlacePosition.BEFORE);
		assert.deepEqual(container.get('parent').get('children'), [ widget5, container ],
			'widget5 should be the first child in the container parent');

		var widget6:any = new Widget();
		container.add(widget6, PlacePosition.AFTER);
		assert.deepEqual(container.get('parent').get('children'), [ widget5, container, widget6 ],
			'widget6 should be the last child in the container parent');

		var widget7:any = new Widget();
		container.add(widget7, 1);
		assert.deepEqual(container.get('children'), [ widget4, widget7 ],
			'widget7 should be the second child in the container');
	},

	'#empty': function () {
		var widget1 = new Widget(),
			widget2 = new Widget(),
			widget3 = new Widget();

		container.add(widget1);
		container.add(widget2);
		container.add(widget3);
		assert.deepEqual(container.get('children'), [widget1, widget2, widget3],
			'All widgets should be children of container');

		container.empty();
		assert.lengthOf(container.get('children'), 0, 'container should have no children');
	},

	'#remove': function () {
		var widget1 = new Widget(),
			widget2 = new Widget(),
			widget3 = new Widget();

		container.add(widget1);
		container.add(widget2);
		container.add(widget3);
		assert.lengthOf(container.get('children'), 3, 'container should have 3 children');

		container.remove(widget2);
		assert.deepEqual(container.get('children'), [widget1, widget3], 'widget2 should have been removed');

		container.remove(0);
		assert.deepEqual(container.get('children'), [widget3], 'widget1 should have been removed');
	},

	'#getChild': function () {
		var widget1 = new Widget(),
			widget2 = new Widget();
		container.add(widget1);
		container.add(widget2);
		assert.strictEqual(container.getChild(0), widget1, 'Child 0 should be widget1');
		assert.strictEqual(container.getChild(1), widget2, 'Child 1 should be widget2');
	},

	'#getChildIndex': function () {
		var widget1 = new Widget(),
			widget2 = new Widget();
		container.add(widget1);
		container.add(widget2);
		assert.strictEqual(container.getChildIndex(widget1), 0, 'Child 0 should be widget1');
		assert.strictEqual(container.getChildIndex(widget2), 1, 'Child 1 should be widget2');
	},

	'#nextChild': function () {
		var widget1 = new Widget(),
			widget2 = new Widget(),
			widget3 = new Widget();
		container.add(widget1);
		container.add(widget2);
		assert.strictEqual(container.nextChild(widget1), widget2, 'Child after widget1 should be widget2');
		assert.isNull(container.nextChild(widget2), 'Child after widget2 should be null');
		assert.isNull(container.nextChild(widget3), 'Child after non-member widget should be null');
	},

	'#previousChild': function () {
		var widget1 = new Widget(),
			widget2 = new Widget(),
			widget3 = new Widget();
		container.add(widget1);
		container.add(widget2);
		assert.isNull(container.previousChild(widget1), 'Child before widget1 should be null');
		assert.strictEqual(container.previousChild(widget2), widget1, 'Child before widget2 should be widget1');
		assert.isNull(container.previousChild(widget3), 'Child before non-member widget should be null');
	},

	'#_attachedSetter': function () {
		var widget1 = new Widget(),
			widget2 = new Widget();
		container.add(widget1);
		container.add(widget2);

		container.set('attached', true);
		assert.isTrue(widget1.get('attached'), 'Widget1 should be attached');
		assert.isTrue(widget2.get('attached'), 'Widget2 should be attached');

		container.set('attached', false);
		assert.isFalse(widget1.get('attached'), 'Widget1 should not be attached');
		assert.isFalse(widget2.get('attached'), 'Widget2 should not be attached');
	},

	'#_childrenSetter': function () {
		var children:Widget[] = [ new Widget(), new Widget() ];
		container.set('children', children);
		assert.sameMembers(container.get('children'), children, 'Widgets should be children of container');

		children = [ new Widget(), new Widget() ];
		container.set('children', children);
		assert.sameMembers(container.get('children'), children, 'New widgets should be only children of container');
	}
});
