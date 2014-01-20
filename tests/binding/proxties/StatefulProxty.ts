/// <reference path="../../intern.d.ts" />

import assert = require('intern/chai!assert');
import binding = require('../../../binding/interfaces');
import BindDirection = require('../../../binding/BindDirection');
import MockProxty = require('../support/MockProxty');
import registerSuite = require('intern!object');
import Stateful = require('dojo/Stateful');
import StatefulProxty = require('../../../binding/proxties/StatefulProxty');
import util = require('../support/util');

var binder:binding.IProxtyBinder;

registerSuite({
	name: 'binding/proxties/StatefulProxty',

	setup: function () {
		binder = util.createProxtyBinder();
		binder.add(StatefulProxty);
	},

	teardown: function () {
		binder = null;
	},

	'.test': function () {
		var result = StatefulProxty.test({
			object: new Stateful({}),
			binding: 'a',
			binder: null
		});

		assert.isTrue(result, 'Should be able to bind to a Stateful object');

		result = StatefulProxty.test({
			object: {},
			binding: 'a',
			binder: null
		});

		assert.isFalse(result, 'Should not be able to bind to a non-Stateful object');

		result = StatefulProxty.test({
			object: null,
			binding: 'a',
			binder: null
		});

		assert.isFalse(result, 'Should not be able to bind to a null object');
	},

	'basic tests': function () {
		var sourceObject = new Stateful({ foo: '1' }),
			source = new StatefulProxty<string, string>({
				object: sourceObject,
				binding: 'foo',
				binder: null
			}),
			target = new MockProxty<string, string>({
				object: {},
				binding: '',
				binder: null
			});

		assert.strictEqual(source.get(), sourceObject.get('foo'), 'Bound source property should match value of source property object');

		var handle = source.bindTo(target);
		assert.strictEqual(target.get(), source.get(), 'Bound target value should match source value');

		source.set('2');
		assert.strictEqual(source.get(), '2', 'Bound source property should match value of source property object');
		assert.strictEqual(sourceObject.get('foo'), '2', 'Setting source property value should update original object');

		sourceObject.set('foo', '3');
		assert.strictEqual(source.get(), '3', 'Bound source property should match value of source property object');
		assert.strictEqual(target.get(), '3', 'Setting source property value should update target property');

		handle.remove();
		sourceObject.set('foo', '4');
		assert.strictEqual(source.get(), '4', 'Bound source property should match value of source property object');
		assert.strictEqual(target.get(), '3', 'Removing binding should stop old target property from updating');

		try {
			handle.remove();
		}
		catch (error) {
			assert.fail(error, null, 'Removing handle a second time should be a no-op');
		}

		source.bindTo(target);
		sourceObject.set('foo', '5');
		assert.strictEqual(target.get(), '5', 'Setting source property value should update target property');

		source.bindTo(null);
		sourceObject.set('foo', '6');
		assert.strictEqual(target.get(), '5', 'Removing binding should stop old target property from updating');

		source.destroy();
		sourceObject.set('foo', '7');
		assert.isUndefined(source.get(), 'Destroyed source property should no longer have a value from the source property object');

		try {
			source.destroy();
		}
		catch (error) {
			assert.fail(error, null, 'Destroying property a second time should be a no-op');
		}
	},

	'setting same value': function () {
		var fakeStateful = {
				numSets: 0,
				value: '1',
				get: function ():any {
					return this.value;
				},
				set: function (key:string, value:any):void {
					var oldValue = this.value;
					++this.numSets;
				},
				watch: function () {
					return {
						remove: function () {}
					};
				}
			},
			source = new StatefulProxty({
				object: fakeStateful,
				binding: 'foo',
				binder: null
			});

		assert.strictEqual(source.get(), '1');
		source.set('1');
		assert.strictEqual(fakeStateful.numSets, 0, 'Setting the same value on a property that is already set should be a no-op');
		source.set('2');
		assert.strictEqual(fakeStateful.numSets, 1, 'Setting a different value should not be a no-op');
	}/*,

	'binder integration': function () {
		var source = new Stateful({ foo: '1' }),
			target = new Stateful({}),
			dfd = this.async();

		binder.bind({
			source: source,
			sourceBinding: 'foo',
			target: target,
			targetBinding: 'foo',
			direction: DataBindingDirection.TWO_WAY
		});

		assert.strictEqual(target.get('foo'), source.get('foo'), 'Target should match source immediately after binding');

		source.set('foo', '2');

		assert.strictEqual(source.get('foo'), '2', 'Source should update immediately');
		assert.strictEqual(target.get('foo'), '1', 'Target should not update to source until after next scheduler tick');

		binder.app.scheduler.afterNext(dfd.callback(function () {
			assert.strictEqual(target.get('foo'), source.get('foo'), 'Source and target should match after scheduler tick');
		}));
	}*/
});
