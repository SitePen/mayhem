/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import Es5Proxty = require('../../../binding/proxties/Es5Proxty');
import MockProxty = require('../support/MockProxty');
import registerSuite = require('intern!object');

function createBasicTests(sourceObject:{ foo?:string; }) {
	return function () {
		var source = new Es5Proxty<string, string>({
				object: sourceObject,
				binding: 'foo',
				binder: null
			}),
			target = new MockProxty<string, string>({
				object: {},
				binding: '',
				binder: null
			});

		assert.strictEqual(source.get(), sourceObject.foo, 'Bound source property should match value of source property object');

		var handle = source.bindTo(target);
		assert.strictEqual(target.get(), source.get(), 'Bound target value should match source value');

		source.set('2');
		assert.strictEqual(source.get(), '2', 'Bound source property should match value of source property object when updated with source.set');
		assert.strictEqual(sourceObject.foo, '2', 'Setting source property value should update original object');

		sourceObject.foo = '3';
		assert.strictEqual(source.get(), '3', 'Bound source property should match value of source property object when object is updated');
		assert.strictEqual(target.get(), '3', 'Setting source property value should update target property');

		handle.remove();
		sourceObject.foo = '4';
		assert.strictEqual(source.get(), '4', 'Bound source property should match value of source property object even when target is removed');
		assert.strictEqual(target.get(), '3', 'Removing binding should stop old target property from updating');

		assert.doesNotThrow(function () {
			handle.remove();
		}, 'Removing handle a second time should be a no-op');

		source.bindTo(target);
		sourceObject.foo = '5';
		assert.strictEqual(target.get(), '5', 'Setting source property value should update target property when rebound');

		source.bindTo(null);
		sourceObject.foo = '6';
		assert.strictEqual(target.get(), '5', 'Removing binding should stop old target property from updating');

		source.destroy();
		sourceObject.foo = '7';
		assert.isUndefined(source.get(), 'Destroyed source property should no longer have a value from the source property object');

		assert.doesNotThrow(function () {
			source.destroy();
		}, 'Destroying property a second time should be a no-op');
	};
}

registerSuite({
	name: 'binding/proxties/Es5Proxty',

	'.test': function () {
		var result = Es5Proxty.test({
			object: {},
			binding: 'foo',
			binder: null
		});

		assert.isTrue(result, 'Should be able to bind to a plain object');

		result = Es5Proxty.test({
			object: { foo: true },
			binding: 'foo',
			binder: null
		});

		assert.isTrue(result, 'Should be able to bind to a plain object where the property already exists');

		var frozenObject = {};
		Object.freeze(frozenObject);

		result = Es5Proxty.test({
			object: frozenObject,
			binding: 'foo',
			binder: null
		});

		assert.isFalse(result, 'Should not be able to bind to a frozen object');

		result = Es5Proxty.test({
			object: null,
			binding: 'foo',
			binder: null
		});

		assert.isFalse(result, 'Should not be able to bind to null');
	},

	'basic tests, no descriptor': createBasicTests({}),
	'basic tests, property descriptor': createBasicTests({ foo: '1' }),
	// TODO: IIFE is a workaround for a bug in TypeScript 0.9.5; see
	// https://typescript.codeplex.com/workitem/1951
	'basic tests, accessor descriptor': (function () {
		return createBasicTests({
			_foo: '1',
			get foo():string {
				return this._foo;
			},
			set foo(value:string) {
				this._foo = value;
			}
		});
	})(),

	'read-only property': function () {
		var sourceObject = {
			get foo() {
				return '1';
			}
		};

		assert.throws(function () {
			var source = new Es5Proxty<string, string>({
				object: sourceObject,
				binding: 'foo',
				binder: null
			});

		}, /read-only/, 'Attempted binding to a read-only property should throw an error');
	},

	'write-only property': function () {
		var sourceObject = {
				bar: <string> undefined,
				set foo(value:string) {
					this.bar = value;
				}
			},
			source = new Es5Proxty<string, string>({
				object: sourceObject,
				binding: 'foo',
				binder: null
			});

		assert.isUndefined(source.get(), 'Getting the value of a write-only property should return undefined');
		source.set('2');
		assert.isUndefined(source.get(), 'Getting the value of a write-only property should return undefined even after being set explicitly');
		assert.strictEqual(sourceObject.bar, '2', 'Setting the value of a write-only property should still call the setter');
	}
});
