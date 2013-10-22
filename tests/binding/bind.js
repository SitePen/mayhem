define([
	'intern!object',
	'intern/chai!assert',
	'dojo/Deferred',
	'bbbb'
], function (registerSuite, assert, Deferred, bind) {
	registerSuite({
		name: 'data-binding primitives',

		'basic bind between two objects': function () {
			var a = {},
				b = {};

			var handle = bind.from(a, 'foo').to(b, 'bar');

			a.foo = '1';

			assert.isUndefined(b.foo, 'Target object should update the property name specified for the ' +
				'target object, not the source object');

			assert.strictEqual(b.bar, '1', 'Target object should be updated with the changed data');

			b.bar = '2';

			assert.strictEqual(a.foo, '1', 'One-way data-binding should not update the source when the ' +
				'target is modified');

			handle.remove();

			a.foo = '3';

			assert.strictEqual(b.bar, '2', 'Target object should no longer be updated when the binding is ' +
				'removed');
		},

		'basic bind between two sub-objects': function () {
			var a = {},
				b = {};

			bind.from(a, 'child.foo').to(b, 'child.bar');

			a.child = {};

			assert.isUndefined(b.child, 'Target object should not have a child object automatically ' +
				'defined when a child object is defined on the source object');

			a.child.foo = '1';

			assert.isUndefined(b.child, 'Target object should not have a child object automatically ' +
				'defined when a child object property is defined on the source object');

			b.child = {};

			assert.strictEqual(b.child.bar, '1', 'Target object should be bound with the correct value once ' +
				'the child object becomes available');

			a.child = {
				foo: '2'
			};

			assert.strictEqual(b.child.bar, '2', 'Target object should be re-bound with the correct value if a ' +
				'child object of the source is updated');

			a.child = null;

			assert.isObject(b.child, 'Target child object should not be destroyed when source child object is ' +
				'destroyed');

			assert.isUndefined(b.child.bar, 'Target property should become undefined when source child object ' +
				'is destroyed');
		},

		'bind between two sub-objects with createObjects': function () {
			var a = {},
				b = {};

			bind.from(a, 'child.foo').to(b, 'child.bar', { createObjects: true });

			a.child = {};

			assert.isUndefined(b.child, 'Target object should not have a child object automatically ' +
				'defined when a child object is defined on the source object without a matching property');

			a.child.foo = '1';

			assert.isObject(b.child, 'Target object should have a child object automatically ' +
				'defined when a matching child property is defined on the source object and createObjects is enabled');

			assert.strictEqual(b.child.bar, '1', 'Target object should be bound with the correct value when ' +
				'the child object is automatically added');

			b.child = {};

			assert.strictEqual(b.child.bar, '1', 'Target object should be bound with the correct value when ' +
				'the child object is changed');

			a.child = {
				foo: '2'
			};

			assert.strictEqual(b.child.bar, '2', 'Target object should be bound with the correct value if a ' +
				'child object of the source is updated');

			a.child = null;

			assert.isObject(b.child, 'Target child object should not be destroyed when source child object is ' +
				'destroyed');

			assert.isUndefined(b.child.bar, 'Target property should become undefined when source child object ' +
				'is destroyed');
		},

		'bind to a computed property': function () {
			var a = {
					firstName: 'Joe',
					lastName: 'Bloggs',
					fullName: {
						isComputed: true,
						get: function () {
							return this.firstName + ' ' + this.lastName;
						},
						set: function (name) {
							name = name.split(' ');
							this.firstName = name[0];
							this.lastName = name[1];
						},
						dependencies: [ 'firstName', 'lastName' ]
					}
				},
				b = {};

			bind.from(a, 'fullName').to(b, 'name');
			bind.from(a, 'firstName').to(b, 'firstName');

			assert.strictEqual(b.name, 'Joe Bloggs');

			a.firstName = 'John';

			assert.strictEqual(b.name, 'John Bloggs', 'Target property should update when a dependent property of ' +
				'the source property changes');

			a.fullName.set('John Doe');

			assert.strictEqual(b.firstName, 'John', 'Target property should update when a reverse dependency of ' +
				'the source property changes');
		},

		'two-way property binding': function () {
			var a = {},
				b = {};

			var handle = bind.from(a, 'foo').toAndFrom(b, 'bar');

			a.foo = '1';

			assert.strictEqual(b.bar, '1', 'Target object should be updated with the changed data');

			b.bar = '2';

			assert.strictEqual(a.foo, '2', 'Two-way data-binding should update the source when the ' +
				'target is modified');

			handle.remove();

			a.foo = '3';

			assert.strictEqual(b.bar, '2', 'Target object should no longer be updated when the binding is removed');

			b.bar = '4';

			assert.strictEqual(a.foo, '3', 'Source object should no longer be updated when the binding is removed');
		},

		'binding with a transform': function () {
			var a = {},
				b = {};

			bind.from(a, 'foo').to(b, 'bar').using(function (value) {
				return String(value).toUpperCase();
			});

			a.foo = 'hello';

			assert.strictEqual(b.bar, 'HELLO', 'Target object should be updated with the changed data, using the ' +
				'transform function');
		},

		'binding with a deferred transform': function () {
			var a = {},
				b = {};

			var dfd = new Deferred();

			bind.from(a, 'foo').to(b, 'bar').using(function (value) {
				setTimeout(function () {
					dfd.resolve(String(value).toUpperCase());
				}, 0);
				return dfd.promise;
			});

			a.foo = 'hello';

			assert.isUndefined(b.bar, 'Target object should not be updated until transform resolves');

			return dfd.promise.then(function () {
				assert.strictEqual(b.bar, 'HELLO', 'Target object should be updated after transform resolves');
			});
		}
	});
});
