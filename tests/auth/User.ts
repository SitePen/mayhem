/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Deferred = require('dojo/Deferred');
import User = require('../../auth/User');

class MockUser extends User {
	authenticate(kwArgs:Object):IPromise<Object> {
		var dfd:IDeferred<Object> = new Deferred<Object>();
		if (kwArgs['username'] === 'foo' && kwArgs['password'] === 'bar') {
			dfd.resolve({ id: 1, username: 'foo' });
		}
		else {
			dfd.reject(new Error('Invalid username or password'));
		}

		return dfd.promise;
	}
}

var user = new MockUser();

registerSuite({
	name: 'User',

	'#login default': function () {
		var user = new User();
		assert.throws(function() { user.login({}) });
	},

	'#login invalid': function () {
		return user.login({ username: 'foo', password: 'wrong' }).then(function () {
			assert.ok(false, 'Invalid login should fail');
		}, function () {
			// suppress instrumentation
		});
	},

	'#login valid': function () {
		return user.login({ username: 'foo', password: 'bar' }).then(function (userData) {
			console.log('userData:', userData);
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
		assert.isNull(user.get('state'), 'User should no longer have state after logout');
	},

	'#checkAccess': function () {
		assert.isTrue(user.checkAccess('delete'), 'User has full access by default');
	}
});
