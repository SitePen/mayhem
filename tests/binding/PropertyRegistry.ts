/// <reference path="../intern.d.ts" />

import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import util = require('./util');
import PropertyRegistry = require('../../binding/PropertyRegistry');
import DataBindingDirection = require('../../binding/DataBindingDirection');
import MockBinder = require('./support/MockBinder');
import lang = require('dojo/_base/lang');

var registry:PropertyRegistry,
	emptyBinding:IDataBindingArguments = {
		source: {},
		sourceBinding: '',
		target: {},
		targetBinding: ''
	};

registerSuite({
	name: 'binding/PropertyRegistry',

	beforeEach: function () {
		registry = util.createPropertyRegistry();
	},

	teardown: function () {
		registry = null;
	},

	'#add': function () {
		// TODO: Mock Property binders to test add, createProperty, test, bind

		var actual = [],
			expected = [ 1, 1, 2, 2, 3, 3 ];

		var FirstBinder = <IPropertyBinder> {
				test: function (kwArgs:IPropertyBinderTestArguments) {
					actual.push(1);
					return false;
				}
			},
			SecondBinder = <IPropertyBinder> {
				test: function (kwArgs:IPropertyBinderTestArguments) {
					actual.push(2);
					return false;
				}
			},
			ThirdBinder = <IPropertyBinder> {
				test: function (kwArgs:IPropertyBinderTestArguments) {
					actual.push(3);
					return false;
				}
			};

		var handles:IHandle[] = [
			registry.add(SecondBinder),
			registry.add(FirstBinder, 0),
			registry.add(ThirdBinder)
		];

		registry.test(emptyBinding);

		assert.deepEqual(actual, expected, 'Binders should be executed in the order specified by `index`');

		var handle:IHandle;
		while ((handle = handles.pop())) {
			handle.remove();

			assert.doesNotThrow(function () {
				handle.remove();
			}, 'Removing handle a second time should be a no-op');
		}
	},

	'#test': function () {
		registry.add(MockBinder);

		var result = registry.test(emptyBinding);

		assert.isTrue(result, 'Testing a binding should be true when there is a valid binder for the source and target');
	},

	'#bind': function () {
		assert.throws(function () {
			registry.bind(emptyBinding);
		}, /No registered property binders understand the requested binding/, 'Attempting an impossible bind should throw');

		registry.add(MockBinder);

		var sourceObject:{ mockBinder:MockBinder; } = { mockBinder: null },
			targetObject:{ mockBinder:MockBinder; } = { mockBinder: null },
			dfd:IInternDeferred<any> = this.async(1000),
			handle:IHandle = registry.bind({
				source: sourceObject,
				sourceBinding: '',
				target: targetObject,
				targetBinding: ''
			});

		sourceObject.mockBinder.emulateUpdate(1);
		targetObject.mockBinder.emulateUpdate(2);
		registry.app.scheduler.afterNext(dfd.rejectOnError(function () {
			assert.strictEqual(targetObject.mockBinder.get(), 1, 'Registry should actually bind the two properties together');
			assert.strictEqual(sourceObject.mockBinder.get(), 1, 'Registry should use one-way binding by default');

			handle.remove();

			assert.doesNotThrow(function () {
				handle.remove();
			}, 'Removing handle a second time should be a no-op');

			handle = registry.bind({
				source: sourceObject,
				sourceBinding: '',
				target: targetObject,
				targetBinding: '',
				direction: DataBindingDirection.TWO_WAY
			});

			targetObject.mockBinder.emulateUpdate(3);
			registry.app.scheduler.afterNext(dfd.callback(function () {
				assert.strictEqual(sourceObject.mockBinder.get(), 3, 'Registry should bind from target to source with two-way binding');
				handle.remove();
			}));
		}));
	},

	'#createProperty': function () {
		// TODO: confirm Property objects are returned, test immediate option
	}
});
