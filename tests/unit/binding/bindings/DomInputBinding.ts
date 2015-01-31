import assert = require('intern/chai!assert');
import bindingInterface = require('../../../../binding/interfaces');
import DomInputBinding = require('../../../../binding/bindings/DomInputBinding');
import has = require('../../../../has');
import registerSuite = require('intern!object');

registerSuite({
	name: 'mayhem/binding/bindings/DomInputBinding',

	'.test'() {
		if (!has('host-browser')) {
			this.skip('DOM-only test');
		}

		var node = document.createElement('input');

		assert.isTrue(DomInputBinding.test({ object: node, path: 'value', binder: null }));
		assert.isTrue(DomInputBinding.test({ object: node, path: 'checked', binder: null }));
		assert.isFalse(DomInputBinding.test({ object: node, path: 'fail', binder: null }));
		assert.isFalse(DomInputBinding.test({ object: {}, path: 'value', binder: null }));
	}
});
