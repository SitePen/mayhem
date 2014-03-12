/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import binding = require('../../../binding/interfaces');
import ObservableProxty = require('../../../binding/proxties/ObservableProxty');
import registerSuite = require('intern!object');
import util = require('../support/util');

var binder:binding.IProxtyBinder;

registerSuite({
	name: 'binding/proxties/ObservableProxty',

	setup: function () {
		binder = util.createProxtyBinder();
	},

	teardown: function () {
		binder = null;
	},

	'.test': function () {
		var result:boolean = ObservableProxty.test({
				object: {
					get: function () {},
					set: function () {},
					observe: function () {}
				},
				binding: '',
				binder: binder
			});

		assert.isTrue(result, 'Should be able to bind an Observable');

		result = ObservableProxty.test({
			object: {},
			binding: '',
			binder: binder
		});

		assert.isFalse(result, 'Should not be able to bind a non-Observable');
	}
});
