/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Widget = require('../../ui/Widget');
import ui = require('../../ui/interfaces');
import PlacePosition = require('../../ui/PlacePosition');
import MockWidget = require('../mocks/ui/Widget');
import MockRenderer = require('../mocks/ui/Renderer');
import Deferred = require('dojo/Deferred');
import util = require('./util');

var widget:Widget,
	configHandle:any;

registerSuite({
	name: 'ui/Widget',

	setup() {
		Widget.prototype._renderer = <any> new MockRenderer();
	},

	teardown() {
		Widget.prototype._renderer = undefined;
	},

	beforeEach: function () {
		widget = new Widget();
	},

	afterEach: function () {
		if (widget) {
			widget.destroy();
			widget = null;
		}
	},

	'constructor': function () {
		assert.isNotNull(widget.get('id'), 'Widget should have id')
		assert.strictEqual(widget.get('index'), -1, 'Un-placed widget should have an index of -1')
		assert.deepPropertyVal(widget._renderer, 'callCounts.render', 1, 'Widget should have been rendered once')

		widget = new Widget({ expectedProperty: 'expectedValue', id: 'expectedId' });
		assert.notProperty(widget, 'expectedProperty');
		assert.strictEqual(widget.get('expectedProperty'), 'expectedValue');
		assert.strictEqual(widget.get('id'), 'expectedId', 'Widget should have expected id');
	},

	'#destroy': function () {
		var removeCounter:any = 3,
			destroyable = {
				destroy() {
					removeCounter--;
				}
			};

		function replaceRemove(handle:any) {
			var oldRemove = handle.remove;
			handle.remove = function () { removeCounter--; oldRemove.apply(handle, arguments) };
		}

		replaceRemove(widget.on('something', function () {}));
		replaceRemove(widget.on('something', function () {}));
		widget.own(destroyable);

		assert.strictEqual(removeCounter, 3, 'Remove counter should have initial value');
		widget.destroy();
		assert.strictEqual(removeCounter, 0, 'Remove counter should be 0');
	},

	'#placeAt': function () {
		var added:any,
			parent = {
				index: 0,
				add(widget:any, index:number) {
					added = widget;
					this.index = index;
				}
			},
			reference:any = {
				index: 0,
				parent: parent,
				add(widget:any) {
					added = 'reference';
				},
				get(key:string) {
					return this[key];
				},
				_renderer: {
					detach() {
						this.detached = true;
					}
				}
			};
		widget.placeAt(reference, PlacePosition.BEFORE);
		assert.strictEqual(added, widget, 'Widget should have been added to the parent');
		assert.strictEqual(parent.index, 0, 'Widget should have been added to the parent at index 0');

		widget.placeAt(reference, PlacePosition.AFTER);
		assert.strictEqual(added, widget, 'Widget should have been added to the parent');
		assert.strictEqual(parent.index, 1, 'Widget should have been added to the parent at index 1');

		widget.placeAt(reference, PlacePosition.REPLACE);
		assert.isTrue(reference._renderer.detached, 'Destination should have been detached');
	},

	'#_indexGetter': function () {
		var parent:any = {
				children: [],
				get(key:string) {
					return this[key];
				},
				getChildIndex(widget:any) {
					return this.children.indexOf(widget);
				},
				remove() {}
			}
		widget.set('parent', parent);

		assert.strictEqual(widget.get('index'), -1, 'Index for non-child widget should be -1');

		parent.children.push(widget);
		assert.strictEqual(widget.get('index'), 0, 'Index should be 0');

		parent.children.push('lastChild');
		assert.strictEqual(widget.get('index'), 0, 'Index should still be 0');

		parent.children.splice(0, 0, 'firstChild');
		assert.strictEqual(widget.get('index'), 1, 'Index should be 1');
	},

	'#_previousGetter': function () {
		var parent:any = {
				children: [],
				previousChild(item:any):any {
					var index = this.children.indexOf(item);
					console.log('index: ' + index);
					return index === -1 ? null : this.children[index - 1];
				},
				remove() {}
			}

		assert.isNull(widget.get('previous'), 'Previous entry for unparented widget should be null');

		widget.set('parent', parent);
		parent.children.push(widget);
		assert.isNull(widget.get('previous'), 'Previous entry should be null');

		parent.children.splice(0, 0, 'firstChild');
		assert.strictEqual(widget.get('previous'), 'firstChild', 'Previous entry should be string');
	},

	'#_nextGetter': function () {
		var parent:any = {
				children: [],
				nextChild(item:any):any {
					var index = this.children.indexOf(item);
					return index === -1 ? null : this.children[index + 1];
				},
				remove() {}
			}

		assert.isNull(widget.get('next'), 'Next entry for unparented widget should be null');

		widget.set('parent', parent);
		parent.children.push(widget);
		assert.isNull(widget.get('next'), 'Next entry should be null');

		parent.children.push('lastChild');
		assert.strictEqual(widget.get('next'), 'lastChild', 'Next entry should be string');
	},

	'.byId': function () {
		widget = new Widget({ id: 'foo' });
		assert.strictEqual(widget, Widget.byId('foo'), 'Widget should be found in registry');
	}
});
