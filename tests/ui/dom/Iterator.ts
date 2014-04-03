/// <reference path="../../../dojo" />
/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import Iterator = require('../../../ui/Iterator');
import Memory = require('dojo/store/Memory');
import Observable = require('../../../Observable');
import ObservableArray = require('../../../ObservableArray');
import registerSuite = require('intern!object');
import ui = require('../../../ui/interfaces');
import util = require('../support/util');
import Widget = require('../../mocks/ui/Widget');
import WidgetFactory = require('../../../templating/WidgetFactory');

var iterator:any,
	renderer:any;

registerSuite({
	name: 'ui/dom/Iterator',

	beforeEach() {
		iterator = new Iterator()
		renderer = iterator._renderer;
	},

	afterEach() {
		iterator = util.destroy(iterator);
	},

	'#destroy'() {
		var destroyed = false,
			widget:any = {
				_impl: { destroy() { destroyed = true; } }
			}
		assert.doesNotThrow(function () {
			renderer.destroy(widget);
		}, 'Destroying renderer should not throw');
		assert.isTrue(destroyed, 'Widget should have been destroyed');
		assert.isNull(widget._impl, 'Widget list implementation should be null');
	},

	'[template observer]'() {
		// set a template and make sure a factory was created
		iterator.set('template', '');
		assert.instanceOf(iterator._factory, WidgetFactory, 'A new factory should have been created');
	},

	'[source observer]': function () {
		var objectSource = new Memory({
				data: [
					{ id: '0', value: 'item 0' },
					{ id: '1', value: 'item 1' }
				]
			}),
			arraySource:any = [ 'item0', 'item1' ];

		// set source to an array -- this will call _updateList immediately rather than deferring it, so we should see
		// an exception
		var origUpdateList = renderer._updateList;
		renderer._updateList = function () {
			assert.throws(() => origUpdateList.apply(this, arguments));
		}
		iterator.set('source', arraySource);

		renderer._updateList = origUpdateList;

		var listRendered = false;
		aspect.before(renderer, '_renderList', function () {
			listRendered = true;
		});

		var listUpdated = false;
		aspect.before(renderer, '_updateList', function () {
			listUpdated = true;
		});

		// set a template to create a _factory
		iterator.set('template', '');

		// set source to an object (for real this time)
		iterator.set('source', objectSource);
		assert.isTrue(listRendered, 'list should have been rendered when assigned object source');
		assert.isFalse(listUpdated, 'list should not been updated when assigned object source');
		assert.strictEqual(iterator._list.get('store'), objectSource, 'list store should be object source');

		// set source to an array
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
