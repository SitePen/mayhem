/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import binding = require('../../../binding/interfaces');
import NodeTargetProxty = require('../../../binding/proxties/NodeTargetProxty');
import registerSuite = require('intern!object');
import util = require('../support/util');

var binder:binding.IProxtyBinder;

registerSuite({
	name: 'binding/proxties/NodeTargetProxty',

	setup: function () {
		binder = util.createProxtyBinder();
	},

	teardown: function () {
		binder = null;
	},

	'.test': function () {
		var element = document.createElement('div'),
			result:boolean = NodeTargetProxty.test({
				object: element,
				binding: '',
				binder: binder
			});

		assert.isTrue(result, 'Should be able to bind a node');

		result = NodeTargetProxty.test({
			object: {},
			binding: '',
			binder: binder
		});

		assert.isFalse(result, 'Should not be able to bind a non-node');
	}
});
