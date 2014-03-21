/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import _IteratorRenderer = require('../../../ui/dom/Iterator');
import aspect = require('dojo/aspect');
import WidgetFactory = require('../../../templating/WidgetFactory');
import ui = require('../../../ui/interfaces');
import util = require('../util');
import Observable = require('../../../Observable');
import Widget = require('../../../ui/Widget');
import MockFactory = require('../../mocks/ui/WidgetFactory');
import MockRenderer = require('../../mocks/ui/Renderer');
import Deferred = require('dojo/Deferred');

class MockStore {
	idProperty = 'id';

	getIdentity() {
		return 'id';
	}

	query() {
		return [
			{ id: '0', value: 'item 0' },
			{ id: '1', value: 'item 1' }
		]
	}
}

var IteratorRenderer:typeof _IteratorRenderer,
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
			undef: [ 'mayhem/ui/dom/Iterator' ]
		});
		require([ '../../../ui/dom/Iterator' ], function (__IteratorRenderer: typeof _IteratorRenderer) {
			IteratorRenderer = __IteratorRenderer;
			dfd.resolve(true);
		});
		return dfd.promise;
	},

	teardown() {
		Widget.prototype._renderer = undefined;
		return configHandle.restore();
	},

	beforeEach() {
		MockFactory.factoriesCreated = 0;
	},

	afterEach() {
		if (configHandle) {
			configHandle.restore();
			configHandle = null;
		}
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

	'#initialize (existing list)': function () {
		var arraySource = [ 'item1', 'item2' ],
			objectSource = new MockStore(),
			widget:any = new Widget();

		var renderer = new IteratorRenderer();

		renderer.initialize(widget);
		assert.property(widget.observers, 'source', 'Widget source should be observed');
		assert.property(widget.observers, 'template', 'Widget template should be observed');

		// set the widget source to an array
		widget.set('source', arraySource);
		assert.isFalse(widget._listDestroyed, '_list should not have been destroyed');
		assert.deepPropertyVal(widget, '_list._renderSource', arraySource, 'Expected source should be rendered');
		assert.deepPropertyVal(widget, '_mediatorIndex[0].source', arraySource[0],
			'First mediator should have sent notification for source[0]');
		assert.deepPropertyVal(widget, '_mediatorIndex[1].source', arraySource[1],
			'Second mediator should have sent notification for source[1]');
		assert.deepPropertyVal(widget, '_mediatorIndex[0].scopeField', 'scope',
			'Mediators should have expected scopeField value');

		// set source to an object
		assert.throws(function () {
			widget.set('source', objectSource);
		}, /Cannot call method/, 'Setting source should throw when template has not been set');

		// set a template and make sure a factory was created
		widget.set('template', '');
		assert.strictEqual(MockFactory.factoriesCreated, 1, 'A new factory should have been created');

		// set source again
		widget.set('source', objectSource);
		assert.isTrue(widget._listDestroyed, '_list should have been destroyed');
		assert.strictEqual(widget.get('classList').className, widget._list.domNode.className, 'widget classlist should have expected value');
		assert.strictEqual(widget._firstNode, widget._list.domNode, 'widget domNode should be list domNode');
	},

	'#initialize (new list)': function () {
		var arraySource = [ 'item1', 'item2' ],
			objectSource = new MockStore();

		var renderer = new IteratorRenderer(),
			widget:any = new Widget();

		widget._list = undefined;
		renderer.initialize(widget);

		// set a template and make sure a factory was created
		widget.set('template', '');
		assert.strictEqual(MockFactory.factoriesCreated, 1, 'A new factory should have been created');

		widget.set('source', arraySource);
		assert.deepPropertyVal(widget, '_mediatorIndex[0].source', arraySource[0],
			'First mediator should have sent notification for source[0]');
		assert.deepPropertyVal(widget, '_mediatorIndex[1].source', arraySource[1],
			'Second mediator should have sent notification for source[1]');
		assert.deepPropertyVal(widget, '_mediatorIndex[0].scopeField', 'scope',
			'Mediators should have expected scopeField value');
		assert.property(widget._widgetIndex, '0', '_widgetIndex should contain index "0"');
		assert.property(widget._widgetIndex, '1', '_widgetIndex should contain index "1"');
		assert.isDefined(widget._list.renderArgs, 'List should have been rendered');
		assert.strictEqual(widget.fragmentReplacedNew, widget._list.domNode,
			'Should have replaced widget _fragment with list node');

		// set the widget source to an object
		widget.set('source', objectSource);
	}
});
