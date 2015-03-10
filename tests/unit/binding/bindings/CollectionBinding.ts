import assert from 'intern/chai!assert';
import * as binding from 'mayhem/binding/interfaces';
import CollectionBinding from 'mayhem/binding/bindings/CollectionBinding';
import MemoryStore from 'dstore/Memory';
import registerSuite from 'intern!object';
import Trackable from 'dstore/Trackable';

interface TestModel {
	id: string;
	newOne?: boolean;
}

var collection: dstore.ISyncCollection<TestModel>;
var testBinding: CollectionBinding<TestModel>;

registerSuite({
	name: 'mayhem/binding/bindings/CollectionBinding<TestModel>',

	beforeEach() {
		var Store = MemoryStore.createSubclass<typeof MemoryStore>(Trackable);
		collection = new Store({ data: [ { id: 'foo' }, { id: 'bar' } ] });
	},

	afterEach() {
		testBinding && testBinding.destroy();
		collection = null;
	},

	'.test'() {
		assert.isTrue(CollectionBinding.test({ object: collection, path: '*', binder: null }));
		assert.isFalse(CollectionBinding.test(
			{ object: new MemoryStore(), path: '*', binder: null }
		), 'Should not attempt to bind to non-trackable collections');
		assert.isFalse(CollectionBinding.test({ object: {}, path: '*', binder: null }));
		assert.isFalse(CollectionBinding.test({ object: 'not an collection', path: '*', binder: null }));
		assert.isFalse(CollectionBinding.test({ object: collection, path: 'length', binder: null }));
		assert.isFalse(CollectionBinding.test({ object: collection, path: 'value', binder: null }));
	},

	'#getObject'() {
		testBinding = new CollectionBinding<TestModel>({ object: collection, path: '*', binder: null });
		assert.strictEqual(testBinding.getObject(), collection);
	},

	add() {
		var dfd = this.async(1000);

		var newObject = { id: 'baz' };
		testBinding = new CollectionBinding<TestModel>({ object: collection, path: '*', binder: null });
		testBinding.observe(dfd.callback(function (change: binding.IChangeRecord<TestModel>) {
			assert.strictEqual(change.index, 2);
			assert.sameMembers(change.added, [ newObject ]);
			assert.isUndefined(change.removed);
		}));
		collection.add(newObject);
	},

	put() {
		var dfd = this.async(1000, 2);

		var newObject = { id: 'bar', newOne: true };
		testBinding = new CollectionBinding<TestModel>({ object: collection.sort('newOne'), path: '*', binder: null });
		testBinding.observe(dfd.callback(function (change: binding.IChangeRecord<TestModel>) {
			if (change.added) {
				assert.strictEqual(change.index, 0);
				assert.sameMembers(change.added, [ newObject ]);
				assert.isUndefined(change.removed);
			}
			else {
				assert.strictEqual(change.index, 1);
				assert.isUndefined(change.added);
				assert.sameMembers(change.removed, [ newObject ]);
			}
		}));

		var oldObject = collection.getSync('bar');
		collection.put(newObject);
	},

	remove() {
		var dfd = this.async(1000);

		testBinding = new CollectionBinding<TestModel>({ object: collection, path: '*', binder: null });
		testBinding.observe(dfd.callback(function (change: binding.IChangeRecord<TestModel>) {
			assert.strictEqual(change.index, 0);
			assert.isUndefined(change.added);
			assert.sameMembers(change.removed, [ oldObject ]);
		}));

		var oldObject = collection.getSync('foo');
		collection.remove('foo');
	}
});
