/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import registerSuite = require('intern!object');
import _DijitRenderer = require('../../../ui/dom/_Dijit');
import Widget = require('../../../ui/Widget');
import Observable = require('../../../Observable');

function resetDijit() {
	var proto = _DijitRenderer.prototype;
	proto._implNameMap = undefined;
	proto._implDefaults = undefined;
	proto._ImplCtor = undefined;

	_DijitRenderer.implementation({
		nameMap: {
			tabindex: 'tabIndex'
		}
	});
}

class MockDijit extends Observable { 
	watchers:any[] = [];
	domNode:Node = null;

	constructor() {
		super();

		var self = this;
		this.domNode = document.createElement('div');
		this.set = function(key:any, value?:any) {
			var oldValue:any = self['_' + key];
			Observable.prototype.set.call(self, key, value);
			if (oldValue !== value) {
				for (var i = 0; i < self.watchers.length; i++) {
					self.watchers[i](key, oldValue, value);
				}
			}
		}
	}

	watch(watcher:Function) {
		this.watchers.push(watcher);
	}

	startup() {
		this.set('started', true);
	}
}

registerSuite({
	name: 'ui/dom/_Dijit',

	setup() {
		Widget.prototype._renderer = new _DijitRenderer();
	},

	teardown() {
		Widget.prototype._renderer = undefined;
	},

	afterEach() {
		resetDijit();
	},

	'.implementation'() {
		var proto = _DijitRenderer.prototype;
		assert.property(proto, '_implNameMap', 'Dijit should have _implNameMap property');
		assert.notProperty(proto, '_implDefaults', 'Dijit should not have _implDefaults property');
		assert.notProperty(proto, '_ImplCtor', 'Dijit should not have _ImplCtor property');

		var map:any = proto._implNameMap;

		_DijitRenderer.implementation({
			nameMap: { foo: 'bar' }
		});
		var newMap:any = proto._implNameMap;
		map.tabindex = 'baz';
		assert.strictEqual(newMap.foo, 'bar', '_implNameMap should have foo property');
		assert.strictEqual(newMap.tabindex, 'baz', '_implNameMap should delegate to old map');

		resetDijit();

		_DijitRenderer.implementation({ defaults: { foo: 'bar' } });
		assert.property(proto, '_implDefaults', 'Dijit should have _implDefaults property');
		var defaults:any = proto._implDefaults;
		_DijitRenderer.implementation({ defaults: { baz: 'gob' } });
		var newDefaults:any = proto._implDefaults;
		defaults.foo = 'cat';
		assert.strictEqual(newDefaults.baz, 'gob', '_implDefaults should have foo property');
		assert.strictEqual(newDefaults.foo, 'cat', '_implDefaults should delegate to old map');

		resetDijit();

		_DijitRenderer.implementation({ constructor: 'foo' });
		assert.strictEqual(proto._ImplCtor, 'foo', '_ImplCtor should have assigned constructor');

		_DijitRenderer.implementation({ constructor: null });
		assert.strictEqual(proto._ImplCtor, null, '_ImplCtor should have assigned null constructor');
	},

	'#render'() {
		_DijitRenderer.implementation({ constructor: MockDijit, });

		var widget:any = new Widget({
				foo: 'bar',
				baz: 'gob',
				classList: new Observable()
			}),
			renderer = new _DijitRenderer();

		renderer.render(widget);

		var dijit = widget._impl;
		assert.strictEqual(widget._firstNode, dijit.domNode, 'widget should use dijit domNode');

		dijit.set('foo', 'bar');
		assert.strictEqual(widget.get('foo'), 'bar', 'widget key should have expected value for arbitrary property');

		dijit.set('tabIndex', 'baz');
		assert.isUndefined(widget.get('tabIndex'), 'widget should not have a value for mapped property');
		assert.strictEqual(widget.get('tabindex'), 'baz',
			'widget key should have expected value for inverse of mapped property name');

		assert.isUndefined(dijit.get('started'), 'dijit should not have been started');
		widget.set('attached', true);
		assert.isTrue(dijit.get('started'), 'dijit should have been started');
		assert.isTrue(dijit.get('attached'), 'dijit attached property should have been set');

		widget.set('tabindex', 'gob');
		assert.strictEqual(dijit.get('tabIndex'), 'gob', 'dijit should have a property for the mapped value');
		widget.set('cat', 'dog');
		assert.strictEqual(dijit.get('cat'), 'dog', 'dijit should have a property for arbitrary value');
	},

	'#_getProperty'() {
		var widget:any = new Observable({ foo: 'bar' }),
			renderer = new _DijitRenderer();
		assert.strictEqual(renderer._getProperty(widget, 'foo'), 'bar', 'Expected property should have been returned');
	}
});
