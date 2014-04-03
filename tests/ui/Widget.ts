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

	'#disown': function () {
		function createHandle() {
			return {
				remove () { console.log('removing...'); this._removed = true; }
			};
		}

		var handle1 = createHandle(),
			handle2 = createHandle(),
			handle3 = createHandle();
		widget.own(handle1, handle2, handle3);
		widget.disown(handle2);
		widget.destroy();

		assert.propertyVal(handle1, '_removed', true, 'handle1 should have been removed');
		assert.notProperty(handle2, '_removed', 'handle2 should not have been removed');
		assert.propertyVal(handle3, '_removed', true, 'handle3 should have been removed');
	},

	'#placeAt': function () {
		var parent:any = {
				_index: null,
				_added: null,
				add(widget:any, index:number) {
					this._added = widget;
					this._index = index;
				}
			},
			reference:any = {
				parent: parent,
				index: 0,
				_index: null,
				_added: null,
				add(widget:any, index:number) {
					this._added = widget;
					this._index = index;
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

		widget.placeAt(reference, PlacePosition.BEFORE);
		assert.strictEqual(parent._added, widget, 'Widget should have been added to the parent');
		assert.strictEqual(parent._index, 0, 'Widget should have been added to the parent at index 0');

		parent._added = null;
		parent.index = null;
		widget.placeAt(reference, PlacePosition.AFTER);
		assert.strictEqual(parent._added, widget, 'Widget should have been added to the parent');
		assert.strictEqual(parent._index, 1, 'Widget should have been added to the parent at index 1');

		// undefined position -- should be last
		widget.placeAt(reference, undefined);
		assert.strictEqual(reference._added, widget, 'Widget should have been added to the reference');
		assert.strictEqual(reference._index, PlacePosition.LAST, 'Widget should have been added to the reference at index -2');

		// positive position -- should be placed in reference at defined position
		widget.placeAt(reference, 0);
		assert.strictEqual(reference._added, widget, 'Widget should have been added to the reference');
		assert.strictEqual(reference._index, 0, 'Widget should have been added to the reference at index 0');

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
		assert.isNull(widget.get('previous'), 'Previous entry from first/only widget should be null');

		parent.children.splice(0, 0, 'firstChild');
		assert.strictEqual(widget.get('previous'), 'firstChild',
			'Previous entry from second widget should not be null');
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
		assert.isNull(widget.get('next'), 'Next entry from last/only widget should be null');

		parent.children.push('lastChild');
		assert.strictEqual(widget.get('next'), 'lastChild', 'Next entry from first widget should not be null');
	},

	'#_visibleSetter': function () {
		var style = widget.get('style');
		widget.set('visible', true);
		assert.strictEqual(style.get('display'), '', 'display style for visible=true should be ""');
		widget.set('visible', false);
		assert.strictEqual(style.get('display'), 'none', 'display style for visible=false should be "none"');
		widget.set('visible', 0);
		assert.strictEqual(style.get('display'), 'none', 'display style for visible=0 should be "none"');
		widget.set('visible', 'foo');
		assert.strictEqual(style.get('display'), '', 'display style for visible="foo" should be ""');
	},

	'.byId': function () {
		widget = new Widget({ id: 'foo' });
		assert.strictEqual(widget, Widget.byId('foo'), 'Widget should be found in registry');
	}
});
