import assert = require('intern/chai!assert');
import bindingInterface = require('mayhem/binding/interfaces');
import ArrayBinding = require('mayhem/binding/bindings/ArrayBinding');
import registerSuite = require('intern!object');

var collection:string[];
var binding:ArrayBinding<string[]>;

registerSuite({
	name: 'mayhem/binding/bindings/ArrayBinding',

	beforeEach() {
		collection = [ 'foo', 'bar' ];
	},

	afterEach() {
		binding && binding.destroy();
		collection = null;
	},

	'.test'() {
		assert.isTrue(ArrayBinding.test({ object: collection, path: '*', binder: null }));
		assert.isFalse(ArrayBinding.test({ object: {}, path: '*', binder: null }));
		assert.isFalse(ArrayBinding.test({ object: 'not an array', path: '*', binder: null }));
		assert.isFalse(ArrayBinding.test({ object: collection, path: 'length', binder: null }));
		assert.isFalse(ArrayBinding.test({ object: collection, path: 'value', binder: null }));
	},

	'#getObject'() {
		binding = new ArrayBinding({ object: collection, path: '*', binder: null });
		assert.strictEqual(binding.getObject(), collection);
	},

	pop() {
		var dfd = this.async(500);

		binding = new ArrayBinding({ object: collection, path: '*', binder: null });
		binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<number>):void {
			assert.strictEqual(change.index, 1);
			assert.sameMembers(change.removed, [ 'bar' ]);
			assert.isUndefined(change.added);
		}));
		collection.pop();
	},

	push() {
		var dfd = this.async(500);

		binding = new ArrayBinding({ object: collection, path: '*', binder: null });
		binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<number>):void {
			assert.strictEqual(change.index, 2);
			assert.sameMembers(change.added, [ 'baz' ]);
			assert.isUndefined(change.removed);
		}));
		collection.push('baz');
	},

	reverse() {
		var dfd = this.async(500);

		binding = new ArrayBinding({ object: collection, path: '*', binder: null });
		binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<number>):void {
			assert.strictEqual(change.index, 0);
			assert.sameMembers(change.added, [ 'bar', 'foo' ]);
			assert.sameMembers(change.removed, [ 'foo', 'bar' ]);
		}));
		collection.reverse();
	},

	shift() {
		var dfd = this.async(500);

		binding = new ArrayBinding({ object: collection, path: '*', binder: null });
		binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<number>):void {
			assert.strictEqual(change.index, 0);
			assert.isUndefined(change.added);
			assert.sameMembers(change.removed, [ 'foo' ]);
		}));
		collection.shift();
	},

	sort() {
		var dfd = this.async(500);

		binding = new ArrayBinding({ object: collection, path: '*', binder: null });
		binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<number>):void {
			assert.strictEqual(change.index, 0);
			assert.sameMembers(change.added, [ 'bar', 'foo' ]);
			assert.sameMembers(change.removed, [ 'foo', 'bar' ]);
		}));
		collection.sort();
	},

	splice: {
		beginning() {
			var dfd = this.async(500);

			binding = new ArrayBinding({ object: collection, path: '*', binder: null });
			binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<number>):void {
				assert.strictEqual(change.index, 0);
				assert.sameMembers(change.added, [ 'baz' ]);
				assert.lengthOf(change.removed, 0);
			}));
			collection.splice(0, 0, 'baz');
		},

		'beginning with replacement'() {
			var dfd = this.async(500);

			binding = new ArrayBinding({ object: collection, path: '*', binder: null });
			binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<number>):void {
				assert.strictEqual(change.index, 0);
				assert.sameMembers(change.added, [ 'baz', 'xyz' ]);
				assert.sameMembers(change.removed, [ 'foo' ]);
			}));
			collection.splice(0, 1, 'baz', 'xyz');
		},

		middle() {
			var dfd = this.async(500);

			binding = new ArrayBinding({ object: collection, path: '*', binder: null });
			binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<number>):void {
				assert.strictEqual(change.index, 1);
				assert.sameMembers(change.added, [ 'baz' ]);
				assert.lengthOf(change.removed, 0);
			}));
			collection.splice(1, 0, 'baz');
		},

		'middle with replacement'() {
			var dfd = this.async(500);

			binding = new ArrayBinding({ object: collection, path: '*', binder: null });
			binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<number>):void {
				assert.strictEqual(change.index, 1);
				assert.sameMembers(change.added, [ 'baz', 'xyz' ]);
				assert.sameMembers(change.removed, [ 'bar' ]);
			}));
			collection.splice(1, 1, 'baz', 'xyz');
		},

		end() {
			var dfd = this.async(500);

			binding = new ArrayBinding({ object: collection, path: '*', binder: null });
			binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<number>):void {
				assert.strictEqual(change.index, 2);
				assert.sameMembers(change.added, [ 'baz' ]);
				assert.lengthOf(change.removed, 0);
			}));
			collection.splice(2, 0, 'baz');
		}
	},

	unshift() {
		var dfd = this.async(500);

		binding = new ArrayBinding({ object: collection, path: '*', binder: null });
		binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<number>):void {
			assert.strictEqual(change.index, 0);
			assert.sameMembers(change.added, [ 'baz' ]);
			assert.isUndefined(change.removed);
		}));
		collection.unshift('baz');
	}
});
