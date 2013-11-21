/// <reference path="../../intern.d.ts" />
/// <reference path="../../../binding/interfaces.ts" />
/// <reference path="../../../interfaces.ts" />

import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import util = require('../util');
import Es5Binder = require('../../../binding/properties/Es5');
import MockBinder = require('../support/MockBinder');

var registry:IDataBindingRegistry;

function createBasicTests(sourceObject:{ foo?:string; }) {
	return function () {
		var source = new Es5Binder({
				object: sourceObject,
				binding: 'foo',
				registry: null
			}),
			target = new MockBinder({
				object: {},
				binding: '',
				registry: null
			});

		assert.strictEqual(source.get(), sourceObject.foo, 'Bound source property should match value of source property object');

		var handle = source.bindTo(target);
		assert.strictEqual(target.get(), source.get(), 'Bound target value should match source value');

		source.set('2');
		assert.strictEqual(source.get(), '2', 'Bound source property should match value of source property object');
		assert.strictEqual(sourceObject.foo, '2', 'Setting source property value should update original object');

		sourceObject.foo = '3';
		assert.strictEqual(source.get(), '3', 'Bound source property should match value of source property object');
		assert.strictEqual(target.get(), '3', 'Setting source property value should update target property');

		handle.remove();
		sourceObject.foo = '4';
		assert.strictEqual(source.get(), '4', 'Bound source property should match value of source property object');
		assert.strictEqual(target.get(), '3', 'Removing binding should stop old target property from updating');

		try {
			handle.remove();
		}
		catch (error) {
			assert.fail(error, null, 'Removing handle a second time should be a no-op');
		}

		source.bindTo(target);
		sourceObject.foo = '5';
		assert.strictEqual(target.get(), '5', 'Setting source property value should update target property');

		source.bindTo(null);
		sourceObject.foo = '6';
		assert.strictEqual(target.get(), '5', 'Removing binding should stop old target property from updating');

		source.destroy();
		sourceObject.foo = '7';
		assert.isUndefined(source.get(), 'Destroyed source property should no longer have a value from the source property object');

		try {
			source.destroy();
		}
		catch (error) {
			assert.fail(error, null, 'Destroying property a second time should be a no-op');
		}
	};
}

registerSuite({
	name: 'binding/properties/Stateful',

	'.test': function () {
		var result = Es5Binder.test({
			object: {},
			binding: 'foo',
			registry: null
		});

		assert.isTrue(result, 'Should be able to bind to a plain object');

		result = Es5Binder.test({
			object: { foo: true },
			binding: 'foo',
			registry: null
		});

		assert.isTrue(result, 'Should be able to bind to a plain object where the property already exists');

		var frozenObject = {};
		Object.freeze(frozenObject);

		result = Es5Binder.test({
			object: frozenObject,
			binding: 'foo',
			registry: null
		});

		assert.isFalse(result, 'Should not be able to bind to a frozen object');

		result = Es5Binder.test({
			object: null,
			binding: 'foo',
			registry: null
		});

		assert.isFalse(result, 'Should not be able to bind to null');
	},

	'basic tests, no descriptor': createBasicTests({}),
	'basic tests, property descriptor': createBasicTests({ foo: '1' }),
	'basic tests, accessor descriptor': createBasicTests({
		_foo: '1',
		get foo():string {
			return this._foo;
		},
		set foo(value:string) {
			this._foo = value;
		}
	}),

	'read-only property': function () {
		var sourceObject = {
			get foo() {
				return '1';
			}
		};

		assert.throws(function () {
			var source = new Es5Binder({
				object: sourceObject,
				binding: 'foo',
				registry: null
			});

		}, /read-only/, 'Attempted binding to a read-only property should throw an error');
	},

	'write-only property': function () {
		var sourceObject = {
				bar: undefined,
				set foo(value:string) {
					this.bar = value;
				}
			},
			source = new Es5Binder({
				object: sourceObject,
				binding: 'foo',
				registry: null
			});

		assert.isUndefined(source.get(), 'Getting the value of a write-only property should return undefined');
		source.set('2');
		assert.isUndefined(source.get(), 'Getting the value of a write-only property should return undefined even after being set explicitly');
		assert.strictEqual(sourceObject.bar, '2', 'Setting the value of a write-only property should still call the setter');
	}
});
