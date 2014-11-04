/// <reference path="../../../../dstore" />
/// <reference path="../../../intern" />

import assert = require('intern/chai!assert');
import bindingInterface = require('../../../../binding/interfaces');
import CollectionLengthBinding = require('../../../../binding/bindings/CollectionLengthBinding');
import declare = require('dojo/_base/declare');
import MemoryStore = require('dstore/Memory');
import registerSuite = require('intern!object');
import Trackable = require('dstore/Trackable');

var binding:CollectionLengthBinding;
var collection:dstore.ICollection<{}>;

interface TestObject {
	id:number;
}

registerSuite({
	name: 'mayhem/binding/bindings/CollectionLengthBinding',

	beforeEach() {
		collection = new (declare<dstore.ICollection<TestObject>>([ MemoryStore, Trackable ]))({
			data: [
				{ id: 1 },
				{ id: 2 }
			]
		}).track();
	},

	afterEach() {
		binding && binding.destroy();
		collection.tracking.remove();
		collection = null;
	},

	'.test'() {
		assert.isTrue(CollectionLengthBinding.test({ object: collection, path: 'totalLength', binder: null }));
		assert.isFalse(CollectionLengthBinding.test({ object: collection, path: 'foo', binder: null }));
		assert.isFalse(CollectionLengthBinding.test({ object: {}, path: 'totalLength', binder: null }));
		assert.isFalse(CollectionLengthBinding.test({ object: { on: null }, path: 'totalLength', binder: null }));
		assert.isFalse(CollectionLengthBinding.test({ object: { fetchRange: null }, path: 'totalLength', binder: null }));
	},

	'#getObject'() {
		binding = new CollectionLengthBinding({ object: collection, path: 'totalLength', binder: null });
		assert.strictEqual(binding.getObject(), collection);
	},

	'default'() {
		binding = new CollectionLengthBinding({ object: collection, path: 'totalLength', binder: null });
		assert.strictEqual(binding.get(), 2);
	},

	'add'() {
		var dfd = this.async(500);
		binding = new CollectionLengthBinding({ object: collection, path: 'totalLength', binder: null });
		binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<number>):void {
			assert.strictEqual(change.value, 3);
		}));
		collection.add({ id: 3 });
	},

	'update'() {
		var dfd = this.async(500);
		binding = new CollectionLengthBinding({ object: collection, path: 'totalLength', binder: null });
		binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<number>):void {
			assert.strictEqual(change.value, 2);
		}));
		collection.put({ id: 2 });
	},

	'remove'() {
		var dfd = this.async(500);
		binding = new CollectionLengthBinding({ object: collection, path: 'totalLength', binder: null });
		binding.observe(dfd.callback(function (change:bindingInterface.IChangeRecord<number>):void {
			assert.strictEqual(change.value, 1);
		}));
		collection.remove(2);
	}
});
