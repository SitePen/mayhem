/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import binding = require('../../../binding/interfaces');
import ObjectTargetProxty = require('../../../binding/proxties/ObjectTargetProxty');
import MockProxty = require('../support/MockProxty');
import registerSuite = require('intern!object');
import util = require('../support/util');

var binder:binding.IProxtyBinder;

registerSuite({
	name: 'binding/proxties/ObjectTargetProxty',

	setup: function () {
		binder = util.createProxtyBinder();
	},

	teardown: function () {
		binder = null;
	},

	'.test': function () {
		var result:boolean = ObjectTargetProxty.test({
				object: {},
				binding: '',
				binder: binder
			});

		assert.isTrue(result, 'Should be able to bind an object');

		result = ObjectTargetProxty.test({
			object: 'test',
			binding: '',
			binder: binder
		});

		assert.isFalse(result, 'Should not be able to bind a non-Object');
	},

	'basic tests': function () {
		var mockObservable = {
				observe: function (name:string, callback:Function) {
					callback();
				},
				get: function () {}
			},
			sourceObject = {
				foo: 'aaa',
				getMetadata: function (key:string):any {
					console.log('getting metadata for ' + key);
					if (key === 'outerKey') {
						return mockObservable;
					}
				}
			},
			source = new ObjectTargetProxty<string>({
				object: sourceObject,
				binding: '',
				binder: binder
			}),
			target = new MockProxty<string>({
				object: {},
				binding: '',
				binder: null
			});

		var handle = source.bindTo(target);
		assert.strictEqual(target.get(), source.get(), 'Bound target value should match source value');

		//source.set('aValue');

		handle.remove();
		handle.remove();

		source.bindTo(null);

		source.bindTo(target, { setValue: false });
		assert.strictEqual(target.get(), source.get(), 'Bound target value should match source value');

		source.set('someValue');

		source.destroy();
		source.destroy();
	}
});
