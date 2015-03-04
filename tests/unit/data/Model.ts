import Application = require('mayhem/Application');
import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Model = require('mayhem/data/Model');
import ValidationError = require('mayhem/validation/ValidationError');

class TestModel extends Model {
	foo: string;
	bar: string;

	get scenarios() {
		return {
			'default': [ 'foo', 'bar' ]
		};
	}

	get validators() {
		return {
			'foo': [
				{
					validate(model: Model, key: string, value: string) {
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

registerSuite({
	name: 'mayhem/data/Model',

	before() {
		app = new Application();
		return app.run();
	},

	'basic tests'() {
		var model = new TestModel({ app });
		model.values = { foo: 'foo', bar: 'bar', baz: 'baz' };
		assert.deepEqual(model.toJSON(), { foo: 'foo', bar: 'bar' });
	},

	'#isDirty'() {
		var model = new TestModel({ app });
		assert.isFalse(model.isDirty);
		model.foo = 'foo';
		assert.isTrue(model.isDirty);
		model.commit();
		assert.isFalse(model.isDirty);
	},

	'#isValid'() {
		var model = new TestModel({ app });
		assert.isTrue(model.isValid);
		model.foo = 'foo';
		return model.validate().then(function (isValid) {
			assert.isTrue(isValid);
			assert.isTrue(model.isValid);
			model.foo = 'notFoo';
			return model.validate();
		}).then(function (isValid) {
			assert.isFalse(isValid);
			assert.isFalse(model.isValid);
			model.foo = 'foo';
			return model.validate();
		}).then(function (isValid) {
			assert.isTrue(isValid);
			assert.isTrue(model.isValid);
		});
	}
});
