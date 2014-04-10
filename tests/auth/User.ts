/// <reference path="../../dojo" />
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

	_idGetter():string {
		return this._state['id'];
	}

	_usernameGetter():string {
		return this._state['username'];
	}
}

var user = new MockUser();

registerSuite({
	name: 'User',

	'#login base': function ():void {
		var user = new User();
		assert.throws(function():void { user.login({}); }, /Abstract method "authenticate" not implemented/,
			'Base User authentication should throw');
	},

	'#login invalid': function ():IPromise<void> {
		return user.login({ username: 'foo', password: 'wrong' }).then(function (userData:Object):void {
			assert.ok(false, 'Invalid login should fail');
		}, function ():void {
			// suppress instrumentation
		});
	},

	'#login valid': function ():IPromise<void> {
		return user.login({ username: 'foo', password: 'bar' }).then(function (userData:Object):void {
			assert.isTrue(user.get('isAuthenticated'), 'Valid login should set user to authenticated state');
			assert.deepEqual(userData, { id: 1, username: 'foo' }, 'Valid login should return authenticated state data');
			assert.deepEqual(user.get('state'), userData, 'Valid login should set user "state" property to authenticated state data');
			assert.strictEqual(user.get('id'), 1, 'Valid login state should be retrievable via User object');
		}, function ():void {
			assert.ok(false, 'Logging in with valid credentials should not fail');
		});
	},

	'#logout valid': function ():void {
		assert.isTrue(user.get('isAuthenticated'), 'User should be authenticated prior to attempting logout');
		user.logout();
		assert.isFalse(user.get('isAuthenticated'), 'User should no longer be authenticated after logout');
		assert.isNull(user.get('state'), 'User should no longer have state after logout');
	},

	'#checkAccess': function ():void {
		assert.isTrue(user.checkAccess('delete'), 'User has full access by default');
	}
});
