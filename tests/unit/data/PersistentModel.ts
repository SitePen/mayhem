import Application = require('mayhem/Application');
import assert = require('intern/chai!assert');
import MemoryStore = require('dstore/Memory');
import registerSuite = require('intern!object');
import PersistentModel = require('mayhem/data/PersistentModel');
import ValidationError = require('mayhem/validation/ValidationError');

class TestModel extends PersistentModel {
	id: number;
	foo: string;
	bar: string;

	get scenarios() {
		return {
			'insert': [ 'foo', 'bar' ],
			'update': [ 'foo', 'bar' ]
		};
	}

	get validators() {
		return {
			'foo': [
				{
					validate(model: TestModel, key: string, value: string) {
						if (value !== 'foo') {
							model.addError(key, new ValidationError('foo is not foo'));
						}
					}
				}
			]
		}
	}
}

var app: Application;
var store: MemoryStore<TestModel>;

registerSuite({
	name: 'mayhem/data/PersistentModel',

	before() {
		app = new Application();
		return app.run();
	},

	beforeEach() {
		store = new MemoryStore<TestModel>();
		TestModel.setDefaultStore(store);
	},

	'.get'() {
		var model = new TestModel({ app });
		model.foo = 'foo';
		store.putSync(model);

		return TestModel.get(model.id).then(function (_model) {
			assert.strictEqual(model, _model);
		});
	},

	'#save'() {
		var model = new TestModel({ app });
		return model.save().then(function () {
			throw new Error('Invalid model should not save');
		}, function (error) {
			assert.lengthOf(model.errors['foo'], 1);
			model.foo = 'foo';
			return model.save().then(function () {
				var result = store.fetchSync();
				// not simply using deepEqual because the result set is an array with extra properties and the
				// extra properties won’t match
				assert.lengthOf(result, 1);
				assert.strictEqual(result[0], model);
			});
		});
	},

	'#delete'() {
		var model = new TestModel({ app });
		model.foo = 'foo';
		return model.save().then(function () {
			assert.lengthOf(store.fetchSync(), 1);
			return model.delete();
		}).then(function () {
			assert.lengthOf(store.fetchSync(), 0);
		});
	}
});
