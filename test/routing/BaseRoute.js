define([
	'intern!object',
	'intern/chai!assert',
	'../../routing/BaseRoute'
], function (registerSuite, assert, BaseRoute) {
	var route;

	registerSuite({
		name: 'BaseRoute',

		setup: function () {
			route = new BaseRoute({ path: '<foo:foo>/<bar:\\d+>/<baz:\\w+>' });
		},

		'#test': function () {
			assert.isTrue(route.test('foo/1234/hi'), 'valid route should test to true');
			assert.isFalse(route.test('oof/hi/1234'), 'invalid route should test to false');
		},

		'#isCaseSensitive': function () {
			assert.isFalse(route.test('FOO/1234/HI'), 'route with different case should test to false in case-sensitive mode');

			// TODO: Fix to use assert.throws
			var thrown = false;
			try {
				route.serialize({ foo: 'FOO', bar: 1234, baz: 'HI' });
			}
			catch (error) {
				thrown = true;
			}

			assert.isTrue(thrown, 'attempting to serialize a path with incorrect case should throw in case-sensitive mode');

			route.set('isCaseSensitive', false);

			assert.isTrue(route.test('FOO/1234/HI'), 'route with different case should test to true in case-insensitive mode');

			assert.strictEqual(
				route.serialize({ foo: 'FOO', bar: 1234, baz: 'HI' }),
				'FOO/1234/HI',
				'attempting to serialize a path with incorrect case should work in case-insensitive mode'
			);

			route.set('isCaseSensitive', true);
		},

		'#parse': function () {
			assert.deepEqual(
				route.parse('foo/1234/hi'),
				{ foo: 'foo', bar: 1234, baz: 'hi' },
				'parsed route should match path definition'
			);

			assert.deepEqual(
				route.parse('foo/1234/hi?blah=boobah'),
				{ foo: 'foo', bar: 1234, baz: 'hi', blah: 'boobah' },
				'parsed route with extra arguments should match path definition'
			);

			assert.deepEqual(
				route.parse('foo/1234/hi', { coerce: false }),
				{ foo: 'foo', bar: '1234', baz: 'hi' },
				'parsed route without coercion should match path definition but not transform strings to numbers'
			);
		},

		'#serialize': function () {
			assert.strictEqual(route.serialize({ foo: 'foo', bar: 1234, baz: 'hi' }), 'foo/1234/hi', 'serialized route should match path definition');
			assert.strictEqual(route.serialize({ foo: 'foo', bar: 1234, baz: 'hi', blah: 'biz', biz: 'blah' }), 'foo/1234/hi?blah=biz&biz=blah', 'serialized route with extra arguments should match path definition');

			// TODO: Fix to use assert.throws
			var thrown = false;
			try {
				route.serialize({});
			}
			catch (error) {
				thrown = true;
			}

			assert.isTrue(thrown, 'attempting to serialize without all required arguments should throw');

			thrown = false;
			try {
				route.serialize({ foo: 'bar', bar: 1234, baz: 'hi' });
			}
			catch (error) {
				thrown = true;
			}

			assert.isTrue(thrown, 'attempting to serialize a path with non-matching arguments should throw');
		},

		'RegExp-like paths': function () {
			var route = new BaseRoute({ path: '<foo:\\w+>\\d+' });
			assert.isTrue(route.test('foo\\d+'), 'regular expressions outside capturing groups should be treated as string literals');
		},

		'multiple identical named identifiers': function () {
			var route = new BaseRoute({ path: '<foo:\\w+>/<foo:\\w+>/<bar:\\w+>' });

			assert.isTrue(route.test('foo/bar/baz'), 'basic test on path with MINIs should pass');

			assert.deepEqual(
				route.parse('foo/bar/baz'),
				{ foo: [ 'foo', 'bar' ], bar: 'baz' },
				'parsing path with MINIs should return an array for the MINI'
			);

			assert.deepEqual(
				route.parse('foo/bar/baz?foo=blah&foo=biz'),
				{ foo: [ 'foo', 'bar', 'blah', 'biz' ], bar: 'baz' },
				'parsing path with MINIs with extra arguments should return an array for the MINI'
			);

			assert.strictEqual(
				route.serialize({ foo: [ 'foo', 'bar' ], bar: 'baz' }),
				'foo/bar/baz',
				'serializing path with MINIs should return a path with MINI arguments in the correct order'
			);

			assert.strictEqual(
				route.serialize({ foo: [ 'foo', 'bar', 'blah', 'biz' ], bar: 'baz' }),
				'foo/bar/baz?foo=blah&foo=biz',
				'serializing path with MINIs should return a path with MINI arguments in the correct order'
			);
		}
	});
});