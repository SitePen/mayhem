define([
	'teststack!object',
	'teststack/assert',
	'dojo/_base/declare',
	'dojo/Deferred',
	'../../auth/User'
], function (registerSuite, assert, declare, Deferred, User) {
	var user = new (declare(User, {
		authenticate: function (kwArgs) {
			var dfd = new Deferred();
			if (kwArgs.username === 'foo' && kwArgs.password === 'bar') {
				dfd.resolve({ id: 1, username: 'foo' });
			}
			else {
				dfd.reject(new Error('Invalid username or password'));
			}

			return dfd.promise;
		}
	}))();

	registerSuite({
		name: 'User',

		'#login invalid': function () {
			return user.login({ username: 'foo', password: 'wrong' }).then(function () {
				assert.ok(false, 'Invalid login should fail');
			}, function () {
				// suppress instrumentation
			});
		},

		'#login valid': function () {
			return user.login({ username: 'foo', password: 'bar' }).then(function (userData) {
				assert.isTrue(user.get('isAuthenticated'), 'Valid login should set user to authenticated state');
				assert.deepEqual(userData, { id: 1, username: 'foo' }, 'Valid login should return authenticated state data');
				assert.deepEqual(user.get('state'), userData, 'Valid login should set user "state" property to authenticated state data');
				assert.strictEqual(user.get('id'), 1, 'Valid login state should be retrievable via User object');
			}, function () {
				assert.ok(false, 'Logging in with valid credentials should not fail');
			});
		},

		'#logout valid': function () {
			assert.isTrue(user.get('isAuthenticated'), 'User should be authenticated prior to attempting logout');
			user.logout();
			assert.isFalse(user.get('isAuthenticated'), 'User should no longer be authenticated after logout');
			assert.strictEqual(user.get('state'), null, 'User should no longer have state after logout');
		}
	});
});