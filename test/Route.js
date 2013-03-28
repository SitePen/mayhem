define([
	'teststack!object',
	'teststack/assert',
	'../Route'
], function (registerSuite, assert, Route) {
	registerSuite({
		name: 'Route',

		'basic tests': function () {
			var route = new Route({ path: '<foo:foo>/<bar:\\d+>/<baz:\\w+>' });
			assert.deepEqual(route.parse('foo/1234/hi?blah=boobah'), { foo: 'foo', bar: '1234', baz: 'hi', blah: 'boobah' }, 'parsed route should match path definition');
			assert.strictEqual(route.serialize({ foo: 'foo', bar: 1234, baz: 'hi', blah: 'boobah' }), 'foo/1234/hi?blah=boobah', 'serialized route should match path definition');
		}
	});
});