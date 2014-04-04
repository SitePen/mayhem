/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import _IteratorRenderer = require('../../../ui/dom/Iterator');
import aspect = require('dojo/aspect');
import WidgetFactory = require('../../../templating/WidgetFactory');
import ui = require('../../../ui/interfaces');
import util = require('../util');
import Observable = require('../../../Observable');
import ObservableArray = require('../../../ObservableArray');
import Widget = require('../../../ui/Widget');
import _Iterator = require('../../../ui/Iterator');
import MockFactory = require('../../mocks/ui/WidgetFactory');
import MockRenderer = require('../../mocks/ui/Renderer');
import Deferred = require('dojo/Deferred');
import Memory = require('dojo/store/Memory');

var IteratorRenderer:typeof _IteratorRenderer,
	Iterator:typeof _Iterator,
	configHandle:any;

registerSuite({
	name: 'ui/dom/Iterator',

	setup() {
		Widget.prototype._renderer = <any> new MockRenderer();

		var dfd:IDeferred<void> = new Deferred<void>();
		configHandle = util.configureLoader({
			map: {
				'dgrid/List': 'mayhem/tests/mocks/dgrid/List',
				'dgrid/OnDemandList': 'mayhem/tests/mocks/dgrid/List',
				'mayhem/templating/WidgetFactory': 'mayhem/tests/mocks/ui/WidgetFactory'
			},
			undef: [ 'mayhem/ui/dom/Iterator', 'mayhem/ui/Iterator' ]
		});
		require([
			'../../../ui/dom/Iterator', '../../../ui/Iterator'
		], function (__IteratorRenderer:typeof _IteratorRenderer, __Iterator:typeof _Iterator) {
			IteratorRenderer = __IteratorRenderer;
			Iterator = __Iterator;
			dfd.resolve(true);
		});
		return dfd.promise;
	},

	teardown() {
		Widget.prototype._renderer = undefined;
		return configHandle.restore();
	},

	'#destroy': function () {
		var renderer = new IteratorRenderer(),
			destroyed = false,
			widget:any = {
				_list: { destroy() { destroyed = true; } }
			}
		assert.doesNotThrow(function () {
			renderer.destroy(widget);
		}, 'Destroying renderer should not throw');
		assert.isTrue(destroyed, 'Widget should have been destroyed');
		assert.isNull(widget._list, 'Widget list should be null');
	},

	'#initialize': function () {
		var iterator:any = new Iterator(),
			renderer = new IteratorRenderer();
		renderer.initialize(iterator);
		assert.property(iterator._observers, 'source', 'iterator source should be observed');
		assert.property(iterator._observers, 'template', 'iterator template should be observed');
	},

	'template observer': function () {
		var iterator:any = new Iterator();

		// check that iterator doesn't start with a factory
		assert.isUndefined(iterator._factory, 'New iterator should not have a factory');

		// set a template and make sure a factory was created
		iterator.set('template', '');
		assert.instanceOf(iterator._factory, MockFactory, 'A new factory should have been created');
	},

	'source observer': function () {
		var objectSource = new Memory({
				data: [
					{ id: '0', value: 'item 0' },
					{ id: '1', value: 'item 1' }
				]
			}),
			iterator:any = new Iterator();

		var listRendered = false;
		aspect.before(iterator._renderer, '_renderList', function () {
			listRendered = true;
		});

		var listUpdated = false;
		aspect.before(iterator._renderer, '_updateList', function () {
			listUpdated = true;
		});

		// set source to an object
		assert.throws(function () {
			iterator.set('source', objectSource);
		}, /Cannot call method/, 'Setting source should throw when template has not been set');

		// set a template to create a _factory
		iterator.set('template', '');

		// set source to an object (for real this time)
		iterator.set('source', objectSource);
		assert.isTrue(listRendered, 'list should have been rendered when assigned object source');
		assert.isFalse(listUpdated, 'list should not been updated when assigned object source');
		assert.strictEqual(iterator._list.get('store'), objectSource, 'list store should be object source');

		// set source to an array
		var arraySource:any = [ 'item0', 'item1' ];
		listRendered = listUpdated = false;
		iterator.set('source', arraySource);
		assert.isTrue(listRendered, 'list should have been rendered when assigned array source');
		assert.isTrue(listUpdated, 'list should have been updated when assigned array source');

		// set source to shorter array
		arraySource = [ 'item0' ];
		listRendered = listUpdated = false;
		var item1Widget = iterator._widgetIndex['1'],
			item1Detached = false;
		aspect.before(item1Widget._renderer, 'detach', function () {
			item1Detached = true;
		});
		iterator.set('source', arraySource);
		assert.isTrue(item1Detached, 'second list item should have been detached');

		// set source to an ObservableArray
		var observableArraySource = new ObservableArray([ 'item0', 'item1' ]);
		listRendered = listUpdated = false;
		iterator.set('source', observableArraySource);
		assert.isTrue(listRendered, 'list should have been rendered when assigned observable array source');
		assert.isTrue(listUpdated, 'list should have been updated when assigned observable array source');

		// push something onto the observable array and see if the iterator observes it
		listRendered = listUpdated = false;
		observableArraySource.push('item 3');
		assert.isTrue(listUpdated, 'list should have been updated when an item was added to the observable array');

		// push something onto the observable array and check that the iterator isn't paying attention
		iterator.set('source', arraySource);
		listRendered = listUpdated = false;
		observableArraySource.push('item 4');
		assert.isFalse(listUpdated, 'list should not have been updated when an item was added to the observable array');
	}
});
