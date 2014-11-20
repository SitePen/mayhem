/// <reference path="../../../dojo" />
/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import Deferred = require('dojo/Deferred');
import Promise = require('../../../Promise');
import registerSuite = require('intern!object');

registerSuite({
	name: 'mayhem/Promise',

	'resolve and progress'() {
		var progressTriggered = false;
		var promise = new Promise(function (resolve, reject, progress) {
			setTimeout(function () {
				progress('progress');
				resolve('resolved');
			}, 0);
		});

		return promise.then(function (result) {
			assert.isTrue(progressTriggered, 'progress event should be triggered');
			assert.strictEqual(result, 'resolved');
		}, function () {
			assert.isTrue(false, 'promise should not be rejected');
		}, function (progress) {
			progressTriggered = true;
			assert.strictEqual(progress, 'progress');
		});
	},

	'reject'() {
		var promise = new Promise(function (resolve, reject) {
			setTimeout(function () {
				reject(new Error('rejected'));
			}, 0);
		});

		return promise.then(function () {
			assert.isFalse(true, 'promise should not be resolved');
		}, function (error) {
			assert.instanceOf(error, Error);
			assert.strictEqual(error.message, 'rejected');
		});
	},

	'cancel'() {
		var dfd = this.async();
		var promise = new Promise(function (resolve, reject, progress, setCanceler) {
			setCanceler(dfd.callback(function (reason:string) {
				assert.strictEqual(reason, 'reason');
			}));
		});

		promise.cancel('reason');
	},

	'error in initializer'() {
		var promise = new Promise(function () {
			throw new Error('bad intitializer');
		});

		return promise.then(function () {
			assert.isFalse(true, 'promise should not be resolved');
		}, function (error) {
			assert.instanceOf(error, Error);
			assert.strictEqual(error.message, 'bad intitializer');
		});
	},

	'.resolve': {
		'with value'() {
			var promise = Promise.resolve('resolved');

			return promise.then(function (result) {
				assert.strictEqual(result, 'resolved');
			}, function (error) {
				assert.isTrue(false, 'promise should not be rejected');
			});
		},

		'with Dojo Promise'() {
			var dfd = new Deferred();
			var promise = Promise.resolve(dfd.promise);

			dfd.resolve('resolved');

			return promise.then(function (result) {
				assert.strictEqual(result, 'resolved');
			}, function (error) {
				assert.isTrue(false, 'promise should not be rejected');
			});
		},

		'with Dojo Deferred'() {
			var dfd = new Deferred();
			var promise = Promise.resolve(dfd);

			dfd.resolve('resolved');

			return promise.then(function (result) {
				assert.strictEqual(result, 'resolved');
			}, function (error) {
				assert.isTrue(false, 'promise should not be rejected');
			});
		}
	},

	'.reject'() {
		var promise = Promise.reject(new Error('rejected'));

		return promise.then(function () {
			assert.isFalse(true, 'promise should not be resolved');
		}, function (error) {
			assert.instanceOf(error, Error);
			assert.strictEqual(error.message, 'rejected');
		});
	}
});
