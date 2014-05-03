/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Iterator = require('../../ui/Iterator');
import Widget = require('../../ui/Widget');
import Mediator = require('../../data/Mediator');
import aspect = require('dojo/aspect');
import MockRenderer = require('../mocks/ui/Renderer');
import Observable = require('../../Observable');
import util = require('./support/util');

var iterator:Iterator,
	iteratorRenderer = Iterator.prototype._renderer;

registerSuite({
	name: 'ui/Iterator',

	setup: function () {
		Widget.prototype._renderer = <any> new MockRenderer();
		Iterator.prototype._renderer = <any> new MockRenderer();
	},

	teardown: function () {
		Widget.prototype._renderer = undefined;
		Iterator.prototype._renderer = iteratorRenderer;
	},

	beforeEach: function () {
		iterator = new Iterator();
	},

	afterEach: function () {
		if (iterator) {
			try {
				iterator.destroy();
			} catch (e) {
				// ignored
			}
			iterator = null;
		}
	},

	'#destroy': function () {
		var widget1 = util.createDestroyable(),
			widget2 = util.createDestroyable(),
			mediator1 = util.createDestroyable(),
			mediator2 = util.createDestroyable();

		// iterator._values = [];
		iterator._widgetIndex = [ widget1, widget2 ];
		iterator._mediatorIndex = [ mediator1, mediator2 ];

		assert.doesNotThrow(function () {
			iterator.destroy();
		}, 'Destroying iterator should not throw');

		assert.isTrue(widget1._destroyed, 'widget1 should have been destroyed');
		assert.isTrue(widget2._destroyed, 'widget2 should have been destroyed');
		assert.isTrue(mediator1._destroyed, 'mediator1 should have been destroyed');
		assert.isTrue(mediator2._destroyed, 'mediator2 should have been destroyed');
	},

	'#_eachSetter': function () {
		var widget0 = new Widget(),
			widget1 = new Widget();
		iterator._widgetIndex = <any> { '0': widget0, '1': widget1 };

		var mediator0:any, mediator1:any;
		aspect.before(widget0, 'set', function (key:string, value:any) {
			if (key === 'mediator') { mediator0 = value; }
		});
		aspect.before(widget1, 'set', function (key:string, value:any) {
			if (key === 'mediator') { mediator1 = value; }
		});

		iterator.set('each', 'foo');
		assert.strictEqual(mediator0, iterator._mediatorIndex['0'],
			'widget0 mediator should have expected value');
		assert.strictEqual(mediator1, iterator._mediatorIndex['1'],
			'widget1 mediator should have expected value');
	},

	'scopedMediator (object source)': function () {
		var index = 0;
		var source = {
				idProperty: 'id',
				get(key:string):any {
					return this[key];
				},
				put(value:any) {
					this[index++] = value;
				}
			},
			model:any = {
				set(key:string, value:any) {
					this[key] = value;
				},
				get(key:string) {
					return this[key];
				}
			};

		source[index++] = 'item0';
		source[index++] = 'item1';

		// create models
		iterator._widgetIndex = <any> {
			'0': new Widget(), '1': new Widget()
		}
		iterator.set('source', source);
		iterator.set('model', model);
		iterator.set('each', 'foo');

		model = iterator._mediatorIndex['0'];

		// get the iterator's "each" property -- should get the source value corresponding to the key for the model
		// ('0')
		var value = model.get('foo');
		assert.strictEqual(value, 'item0', 'Value for iterator "each" property should have expected value');

		// is a store value since we're using a mock store source
		var newValue = { id: '2', value: 'item2' };
		model.set('foo', newValue);
		assert.propertyVal(source, '2', newValue, 'New property should have been added to source');
	},

	'scopedMediator (array source)': function () {
		var source = [ 'item0', 'item1' ],
			model:any = {
				set(key:string, value:any) {
					this[key] = value;
				},
				get(key:string):any {
					return this[key];
				}
			};

		// create models
		iterator._widgetIndex = <any> {
			'0': new Widget(), '1': new Widget()
		}
		iterator.set('source', source);
		iterator.set('model', model);
		iterator.set('each', 'foo');

		var scopedMediator = iterator._mediatorIndex['0'];

		// get the iterator's "each" property -- should get the source value corresponding to the key for the model
		// ('0')
		var value = scopedMediator.get('foo');
		assert.strictEqual(value, 'item0', 'Value for iterator "each" property should have expected value');

		// getting an arbitrary property from the scopedMediator should defer to the original model
		model.bar = 'baz';
		value = scopedMediator.get('bar');
		assert.strictEqual(value, 'baz', 'Value for arbitrary model property should have expected value');

		var newValue = { id: '2', value: 'new baz value' };
		scopedMediator.set('foo', newValue);
		// should set value for source index corresponding to the model index; we're using model 0
		assert.propertyVal(source, '0', newValue, 'New property should have been added to source');

		var setValue = {};
		source = [ 'item0', 'item1' ];
		source['set'] = function (key:string, value:any) {
			setValue[key] = value;
		}
		iterator.set('source', source);
		scopedMediator.set('foo', newValue);
		assert.deepEqual(setValue, { '0': newValue }, 'New property should have been set on source at key "0"');

		// setting an arbitrary property on the scoped model should set it on the original model
		scopedMediator.set('bar', 'frob');
		assert.propertyVal(model, 'bar', 'frob', 'Original model should have new property');
	},

	'#_getMediatorByKey': function () {
		var model:any = new Mediator();
		iterator._mediatorIndex = <any> { '0': model }
		assert.strictEqual(iterator._getMediatorByKey('0'), model, 'Should have gotten expected model for key 0');

		iterator.set('model', model);

		model = iterator._getMediatorByKey('1');
		assert.propertyVal(iterator._mediatorIndex, '1', model, 'Should have gotten new model for key 1');
	},
});
