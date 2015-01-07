/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import bindingInterface = require('../../../../binding/interfaces');
import DomInputBinding = require('../../../../binding/bindings/DomInputBinding');
import has = require('../../../../has');
import on = require('dojo/on');
import registerSuite = require('intern!object');

var binding:DomInputBinding<any>;
var node:HTMLInputElement;

if (has('host-browser')) {
	registerSuite({
		name: 'mayhem/binding/bindings/DomInputBinding',

		beforeEach() {
			node = document.createElement('input');
		},

		afterEach() {
			binding && binding.destroy();
			node && (<any> node).remove && (<any> node).remove();
		},

		'.test'() {
			assert.isTrue(DomInputBinding.test({ object: node, path: 'value', binder: null }));
			assert.isTrue(DomInputBinding.test({ object: node, path: 'checked', binder: null }));
			assert.isFalse(DomInputBinding.test({ object: node, path: 'fail', binder: null }));
			assert.isFalse(DomInputBinding.test({ object: {}, path: 'value', binder: null }));
		},

		'input value'() {
			var observedValue:string;

			binding = new DomInputBinding<string>({ object: node, path: 'value', binder: null });
			binding.observe(function (change:bindingInterface.IChangeRecord<string>) {
				observedValue = change.value;
			});

			node.value = 'input';
			(<any> on).emit(node, 'input', {});
			assert.strictEqual(observedValue, 'input');

			node.value = 'change';
			(<any> on).emit(node, 'change', {});
			assert.strictEqual(observedValue, 'change');

			node.value = 'propertychange';
			(<any> on).emit(node, 'propertychange', { propertyName: 'value' });
			assert.strictEqual(observedValue, 'propertychange');
		},

		'input checked'() {
			var observedValue:boolean;

			binding = new DomInputBinding<boolean>({ object: node, path: 'checked', binder: null });
			binding.observe(function (change:bindingInterface.IChangeRecord<boolean>) {
				observedValue = change.value;
			});

			node.checked = false;
			(<any> on).emit(node, 'change', {});
			assert.isFalse(observedValue);

			node.checked = true;
			(<any> on).emit(node, 'change', {});
			assert.isTrue(observedValue);
		}
	});
}
