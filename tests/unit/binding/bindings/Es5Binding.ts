import assert = require('intern/chai!assert');
import bindingInterface = require('../../../../binding/interfaces');
import Es5Binding = require('../../../../binding/bindings/Es5Binding');
import has = require('../../../../has');
import registerSuite = require('intern!object');

var binding:Es5Binding<any>;

if (has('es5')) {
	registerSuite({
		name: 'mayhem/binding/bindings/Es5Binding',

		'.test'() {
			var obj:Object;

			obj = {};
			assert.isTrue(Es5Binding.test({ object: obj, path: 'foo', binder: null }));

			Object.defineProperty(obj, 'foo', {
				configurable: true,
				enumerable: true,
				writeable: true,
				set: function (value) {
					this.value = value;
				}
			});
			assert.isTrue(Es5Binding.test({ object: obj, path: 'foo', binder: null }));

			obj = {};
			Object.defineProperty(obj, 'foo', {
				configurable: true,
				enumerable: true,
				writeable: true,
				value: ''
			});
			assert.isTrue(Es5Binding.test({ object: obj, path: 'foo', binder: null }));

			obj = {};
			Object.preventExtensions(obj);
			assert.isFalse(Es5Binding.test({ object: obj, path: 'foo', binder: null }));

			obj = {};
			Object.defineProperty(obj, 'foo', {
				configurable: false,
				enumerable: true,
				writeable: true
			});
			assert.isFalse(Es5Binding.test({ object: obj, path: 'foo', binder: null }));
		},

		binding() {
			var dfd = this.async(500);
			var obj:any = {};
			var binding = new Es5Binding({ object: obj, path: 'foo', binder: null });

			binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<string>) {
				assert.strictEqual(change.value, 'bar');
				assert.isUndefined(change.oldValue);
			}));
			obj.foo = 'bar';
		}
	});
}
