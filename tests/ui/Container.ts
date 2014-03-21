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
		var widget:any = new Widget(),
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
		// set all indexes to 0 since they'll be removed in-order
		var widget1:any = new Widget(),
			widget2:any = new Widget(),
			widget3:any = new Widget();

		container.add(widget1);
		container.add(widget2);
		container.add(widget3);
		assert.deepEqual(container.get('children'), [widget1, widget2, widget3],
			'All widgets should be children of container');

		container.empty();
		assert.lengthOf(container.get('children'), 0, 'container should have no children');
	},

	'#remove': function () {
		var widget1:any = new Widget(),
			widget2:any = new Widget(),
			widget3:any = new Widget();

		container.add(widget1);
		container.add(widget2);
		container.add(widget3);
		assert.lengthOf(container.get('children'), 3, 'container should have 3 children');

		container.remove(widget2);
		assert.deepEqual(container.get('children'), [widget1, widget3], 'widget2 should have been removed');

		container.remove(0);
		assert.deepEqual(container.get('children'), [widget3], 'widget1 should have been removed');
	}
});
