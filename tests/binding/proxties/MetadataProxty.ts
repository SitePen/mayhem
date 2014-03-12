/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import binding = require('../../../binding/interfaces');
import MetadataProxty = require('../../../binding/proxties/MetadataProxty');
import MockProxty = require('../support/MockProxty');
import registerSuite = require('intern!object');
import util = require('../support/util');

var binder:binding.IProxtyBinder;

registerSuite({
	name: 'binding/proxties/MetadataProxty',

	setup: function () {
		binder = util.createProxtyBinder();
		binder.add(MetadataProxty);
	},

	teardown: function () {
		binder = null;
	},

	'.test': function () {
		var result:boolean = MetadataProxty.test({
			object: { getMetadata: function () {} },
			binding: 'something!foo.bar',
			binder: binder
		});

		assert.isTrue(result, 'Should be able to bind an object when the method name is registered');

		result = MetadataProxty.test({
			object: { getMetadata: function () {} },
			binding: 'something.else!foo.bar',
			binder: binder
		});

		assert.isTrue(result, 'Should be able to bind an object when the method name is registered');

		result = MetadataProxty.test({
			object: { getMetadata: function () {} },
			binding: 'foo.bar',
			binder: binder
		});

		assert.isFalse(result, 'Should not be able to bind an object when no binding is specified');

		result = MetadataProxty.test({
			object: {},
			binding: 'something!foo.bar',
			binder: binder
		});

		assert.isFalse(result, 'Should not be able to bind an object that has no metadata');
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
			source = new MetadataProxty<string>({
				object: sourceObject,
				binding: 'outerKey!outerField.innerKey!innerField.bar',
				binder: binder
			}),
			target = new MockProxty<string>({
				object: {},
				binding: '',
				binder: null
			});

		var handle = source.bindTo(target);
		assert.strictEqual(target.get(), source.get(), 'Bound target value should match source value');

		handle.remove();
		handle.remove();

		source.bindTo(null);

		source.bindTo(target, { setValue: false });
		assert.strictEqual(target.get(), source.get(), 'Bound target value should match source value');

		source.destroy();
	}
});
