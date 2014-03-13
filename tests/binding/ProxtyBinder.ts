/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import BindDirection = require('../../binding/BindDirection');
import binding = require('../../binding/interfaces');
import lang = require('dojo/_base/lang');
import MockProxty = require('./support/MockProxty');
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

		sourceObject.mockProxty.emulateUpdate(1);
		targetObject.mockProxty.emulateUpdate(2);
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

	'#bind bidirectional': function () {
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
			//newSourceObject:{ mockProxty:MockProxty<number>; } = { mockProxty: null },
			//newTargetObject:{ mockProxty:MockProxty<number>; } = { mockProxty: null };

		sourceObject.mockProxty.emulateUpdate(1);
		targetObject.mockProxty.emulateUpdate(2);
		binder._app.get('scheduler').afterNext(dfd.rejectOnError(function () {
			console.log('running scheduled update');
			dfd.resolve(true);
		}));
	},

	'update binding': function () {
		// TODO: <any> casting is needed due to TS#2087
		binder.add(<any> MockProxty);

		var sourceObject:{ mockProxty:MockProxty<number>; } = { mockProxty: null },
			targetObject:{ mockProxty:MockProxty<number>; } = { mockProxty: null },
			handle:binding.IBindingHandle = binder.bind({
				source: sourceObject,
				sourceBinding: '',
				target: targetObject,
				targetBinding: '',
				direction: 2
			}),
			newSourceObject:{ mockProxty:MockProxty<number>; } = { mockProxty: null },
			newTargetObject:{ mockProxty:MockProxty<number>; } = { mockProxty: null };

		//console.log('source value:', sourceObject.get());

		handle.setSource(newSourceObject);

		handle.setTarget(newTargetObject);

		handle.setDirection(0);
	},

	'#createProxty': function () {
		// TODO: confirm Proxty objects are returned, test immediate option
	}
});
