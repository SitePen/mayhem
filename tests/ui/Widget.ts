/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Widget = require('../../ui/Widget');
import ui = require('../../ui/interfaces');
import PlacePosition = require('../../ui/PlacePosition');
import MockWidget = require('../mocks/ui/Widget');
import MockRenderer = require('../mocks/ui/Renderer');
import Deferred = require('dojo/Deferred');
import util = require('./support/util');

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

	'.constructor': function () {
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
				remove () { this._removed = true; }
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
				_added: null,
				add(widget:any, index:number) {
					this._added = [ widget, index ];
				}
			},
			destination:any = {
				parent: parent,
				index: 'foo',
				_added: null,
				get(key:string) {
					return this[key];
				},
				add(widget:any, index:number) {
					this._added = [ widget, index ];
				},
				_renderer: {
					_detached: null,
					detach(widget:any) {
						this._detached = true;
					}
				}
			};

		assert.throws(function () {
			widget.placeAt(null, null);
		}, Error, /Cannot place/, 'Placing with no destination should throw');

		widget.placeAt(destination, PlacePosition.BEFORE);
		assert.deepEqual(parent._added, [ widget, 'foo' ], 'Widget should have been added to the parent');

		parent.add(null, null)
		widget.placeAt(destination, PlacePosition.AFTER);
		assert.deepEqual(parent._added, [ widget, 'foo1' ], 'Widget should have been added to the parent at index + 1');

		// null position -- should be last
		widget.placeAt(destination, null);
		assert.deepEqual(destination._added, [ widget, null ], 'Widget should have been added to the destination');

		// undefined position -- should be placed in destination at defined position
		destination.add(null, null)
		widget.placeAt(destination, undefined);
		assert.deepEqual(destination._added, [ widget, PlacePosition.LAST ],
			'Widget should have been added to the destination at the last position');

		// positive position -- should be placed in destination at defined position
		destination.add(null, null)
		widget.placeAt(destination, 0);
		assert.deepEqual(destination._added, [ widget, 0 ], 'Widget should have been added to the destination at 0');

		// replace -- destination should be replaced
		parent.add(null, null)
		widget.placeAt(destination, PlacePosition.REPLACE);
		assert.isTrue(destination._renderer._detached, 'Destination should have been detached');
		assert.deepEqual(parent._added, [ widget, 'foo' ], 'Widget should have been added to the parent');

		// try to place adjacent to destination that has no parent
		destination.parent = null;
		assert.throws(function () {
			widget.placeAt(destination, PlacePosition.BEFORE);
		}, Error, /Destination widget/, 'Placing BEFORE with no destination parent should throw');
		assert.throws(function () {
			widget.placeAt(destination, PlacePosition.AFTER);
		}, Error, /Destination widget/, 'Placing AFTER with no destination parent should throw');
		assert.throws(function () {
			widget.placeAt(destination, PlacePosition.REPLACE);
		}, Error, /Destination widget/, 'REPLACING with no destination parent should throw');

		assert.doesNotThrow(function () {
			widget.placeAt(destination, 0);
		}, 'Placing inside a destination with no parent should not throw');

	},

	'#_indexGetter': function () {
		var parent:any = {
				getChildIndex() { return 'foo' },
				remove() {}
			}

		assert.strictEqual(widget.get('index'), -1, 'Index for non-child widget should be -1');
		widget.set('parent', parent);
		assert.strictEqual(widget.get('index'), 'foo', 'Widget should have requested index from parent');
	},

	'#_previousGetter': function () {
		var parent:any = {
				previousChild() { return 'foo'; },
				remove() {}
			}

		assert.isNull(widget.get('previous'), 'Previous entry for unparented widget should be null');
		widget.set('parent', parent);
		assert.strictEqual(widget.get('previous'), 'foo', 'Widget should have requested previous child from parent');
	},

	'#_nextGetter': function () {
		var parent:any = {
				nextChild() { return 'foo' },
				remove() {}
			}

		assert.isNull(widget.get('next'), 'Next entry for unparented widget should be null');
		widget.set('parent', parent);
		assert.strictEqual(widget.get('next'), 'foo', 'Widget should have requested next child from parent');
	},

	'#_attachedSetter': function () {
		widget.set('attached', 'foo')
		assert.strictEqual(widget.get('attached'), 'foo', 'Widget attached property should have expected value')
	},

	'.byId': function () {
		widget = new Widget({ id: 'foo' });
		assert.strictEqual(widget, Widget.byId('foo'), 'Widget should be found in registry');
	}
});
