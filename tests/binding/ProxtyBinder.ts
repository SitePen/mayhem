/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import BindDirection = require('../../binding/BindDirection');
import binding = require('../../binding/interfaces');
import lang = require('dojo/_base/lang');
import MockProxty = require('./support/MockProxty');
import Observable = require('../../Observable');
import Proxty = require('../../Proxty');
import ProxtyBinder = require('../../binding/ProxtyBinder');
import registerSuite = require('intern!object');
import util = require('./support/util');

var binder:ProxtyBinder,
	emptyBinding:binding.IBindArguments = {
		source: {},
		sourceBinding: '',
		target: {},
		targetBinding: ''
	};

registerSuite({
	name: 'binding/ProxtyBinder',

	beforeEach: function () {
		binder = util.createProxtyBinder();
	},

	teardown: function () {
		binder = null;
	},

	'#add': function () {
		// TODO: Mock binder to test add, createProxty, test, bind

		var actual:number[] = [],
			expected = [ 1, 1, 2, 2, 3, 3 ];

		var FirstProxty = <binding.IProxtyConstructor> {
				test: function (kwArgs:binding.IProxtyArguments) {
					actual.push(1);
					return false;
				}
			},
			SecondProxty = <binding.IProxtyConstructor> {
				test: function (kwArgs:binding.IProxtyArguments) {
					actual.push(2);
					return false;
				}
			},
			ThirdProxty = <binding.IProxtyConstructor> {
				test: function (kwArgs:binding.IProxtyArguments) {
					actual.push(3);
					return false;
				}
			};

		var handles:IHandle[] = [
			// TODO: <any> casting is needed due to TS#2087
			binder.add(<any> SecondProxty),
			binder.add(<any> FirstProxty, 0),
			binder.add(<any> ThirdProxty)
		];

		binder.test(emptyBinding);

		assert.deepEqual(actual, expected, 'Proxty constructors should be executed in the order specified by `index`');

		var handle:IHandle;
		while ((handle = handles.pop())) {
			handle.remove();

			assert.doesNotThrow(function () {
				handle.remove();
			}, 'Removing handle a second time should be a no-op');
		}
	},

	'#test': function () {
		// TODO: <any> casting is needed due to TS#1983
		binder.add(<any> MockProxty);

		var result = binder.test(emptyBinding);

		assert.isTrue(result, 'Testing a binding should be true when there is a valid binder for the source and target');
	},

	'#bind': function () {
		assert.throws(function () {
			binder.bind(emptyBinding);
		}, /No registered proxty constructors understand the requested binding/, 'Attempting an impossible bind should throw');

		// TODO: <any> casting is needed due to TS#2087
		binder.add(<any> MockProxty);

		var sourceObject:{ mockProxty:MockProxty<number>; } = { mockProxty: null },
			targetObject:{ mockProxty:MockProxty<number>; } = { mockProxty: null },
			dfd:IInternDeferred<any> = this.async(1000),
			handle:binding.IBindingHandle = binder.bind({
				source: sourceObject,
				sourceBinding: '',
				target: targetObject,
				targetBinding: ''
			});

		// updates will be scheduled by calls to mockProxty#set
		sourceObject.mockProxty.emulateUpdate(1);
		targetObject.mockProxty.emulateUpdate(2);

		// tests are scheduled to run after the updates are processed
		binder._app.get('scheduler').afterNext(dfd.rejectOnError(function () {
			assert.strictEqual(targetObject.mockProxty.get(), 1, 'Binder should actually bind the two properties together');
			assert.strictEqual(sourceObject.mockProxty.get(), 1, 'Binder should use one-way binding by default');

			handle.remove();

			assert.doesNotThrow(function () {
				handle.remove();
			}, 'Removing handle a second time should be a no-op');

			handle = binder.bind({
				source: sourceObject,
				sourceBinding: '',
				target: targetObject,
				targetBinding: '',
				direction: BindDirection.TWO_WAY
			});

			targetObject.mockProxty.emulateUpdate(3);
			binder._app.get('scheduler').afterNext(dfd.callback(function () {
				assert.strictEqual(sourceObject.mockProxty.get(), 3, 'Binder should bind from target to source with two-way binding');
				handle.remove();
			}));
		}));
	},

	'update binding': function () {
		// TODO: <any> casting is needed due to TS#2087
		binder.add(<any> MockProxty);

		var sourceObject:{ mockProxty:MockProxty<number>; } = { mockProxty: null },
			targetObject:{ mockProxty:MockProxty<number>; } = { mockProxty: null },
			dfd:IInternDeferred<any> = this.async(1000),
			handle:binding.IBindingHandle = binder.bind({
				source: sourceObject,
				sourceBinding: '',
				target: targetObject,
				targetBinding: '',
				direction: BindDirection.TWO_WAY
			}),
			newSourceObject:{ mockProxty:MockProxty<number>; } = { mockProxty: null },
			newTargetObject:{ mockProxty:MockProxty<number>; } = { mockProxty: null };

		handle.setSource(newSourceObject);
		assert.isUndefined(sourceObject.mockProxty, 'Original source proxty should have been destroyed');

		newSourceObject.mockProxty.emulateUpdate(1);
		binder._app.get('scheduler').afterNext(dfd.rejectOnError(function () {
			assert.strictEqual(targetObject.mockProxty.get(), 1, 'Target should be bound to new source');

			handle.setTarget(newTargetObject);
			newTargetObject.mockProxty.emulateUpdate(2);
			binder._app.get('scheduler').afterNext(dfd.callback(function () {
				assert.strictEqual(newSourceObject.mockProxty.get(), 2, 'Source should be bound to new target');

				handle.setDirection(BindDirection.ONE_WAY);
				assert.isNull(newTargetObject.mockProxty.target, 'Target binding should be null');
			}));
		}));
	},

	'#createProxty': function () {
		binder.add(<any> MockProxty);

		var sourceObject = { foo: 1 },
			proxty = binder.createProxty(sourceObject, 'foo', { scheduled: false });

		assert.instanceOf(proxty, MockProxty, 'Returned object should be a Proxty');

		proxty.set(2);
		assert.strictEqual(proxty.get(), 2, 'Proxty value should be updated immediately');
	},

	'#getMetadata': function () {
		binder.add(<any> MockProxty);

		var retrievedKey:string,
			metadataObjects = {},
			sourceObject = {
				getMetadata: function (key:string) {
					if (!metadataObjects[key]) {
						// metadata should be an IObservable
						var obj = metadataObjects[key] = new Observable();
						obj.set('value', 'someValue');
						obj.set('label', key);
					}
					return metadataObjects[key];
				}
			},
			metadata = binder.getMetadata(sourceObject, 'foo');

		assert.instanceOf(metadata, Proxty, 'Metadata should be a Proxty');
		assert.strictEqual(metadata.get().get('label'), 'foo', 'Correct metadata should have been retrieved from source object');
		assert.strictEqual(metadata.get().get('value'), 'someValue', 'Metadata should have expected value');

		metadata = <any> binder.getMetadata(sourceObject, 'bar', 'label');
		assert.strictEqual(metadata.get(), 'bar', 'Proxty should have metadata label value');

		metadataObjects['bar'].set('label', 'baz');
		assert.strictEqual(metadata.get(), 'baz', 'Proxty value should have been updated');

		metadata.destroy();
		assert.doesNotThrow(function () {
			metadata.destroy()
		}, 'Calling destroy multiple times should not throw');

		metadata = <any> binder.getMetadata(sourceObject, 'aParent.aKey', 'aField');
	}
});
