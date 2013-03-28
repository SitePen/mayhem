define([
	'teststack!object',
	'teststack/assert',
	'../Route'
], function (registerSuite, assert, Route) {
	registerSuite({
		name: 'Route',

		'basic tests': function () {
			var route = new Route({ path: '<foo:foo>/<bar:\\d+>/<baz:\\w+>' });

			assert.deepEqual(route.parse('foo/1234/hi'), { foo: 'foo', bar: '1234', baz: 'hi' }, 'parsed route should match path definition');
			assert.deepEqual(route.parse('foo/1234/hi?blah=boobah'), { foo: 'foo', bar: '1234', baz: 'hi', blah: 'boobah' }, 'parsed route with extra arguments should match path definition');
			assert.strictEqual(route.serialize({ foo: 'foo', bar: 1234, baz: 'hi' }), 'foo/1234/hi', 'serialized route should match path definition');
			assert.strictEqual(route.serialize({ foo: 'foo', bar: 1234, baz: 'hi', blah: 'boobah' }), 'foo/1234/hi?blah=boobah', 'serialized route with extra arguments should match path definition');

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
		}
	});
});