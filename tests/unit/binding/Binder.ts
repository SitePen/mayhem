/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import Binder = require('../../../binding/Binder');
import Binding = require('../../../binding/Binding');
import BindingError = require('../../../binding/BindingError');
import bindingInterface = require('../../../binding/interfaces');
import MockBinder = require('../../support/MockBinder');
import registerSuite = require('intern!object');

registerSuite({
	name: 'mayhem/binding/Binder',

	'#add'() {
		var binder = new Binder({
			constructors: []
		});
		var handle:IHandle;

		// TODO: fix MockBinder type
		handle = binder.add(<any> MockBinder);

		assert.isTrue(binder.test({
			source: {
				test: true
			},
			sourcePath: 'a',
			target: {
				test: true
			},
			targetPath: 'a'
		}));

		handle.remove();

		assert.isFalse(binder.test({
			source: {
				test: true
			},
			sourcePath: 'a',
			target: {
				test: true
			},
			targetPath: 'a'
		}));
	},

	'#run'() {
		/*
		 * The 'run' method should load modules for any constructors specified as module ids,
		 * so we specify a mid, call run, then do something that employs the constructor: in this case,
		 * call binder.test, which in turn will call the constructor's static 'test' method.
		 * If the method gets called, we know that 'run' has done its job.
		 */

		var binder = new Binder({
			constructors: [ require.toAbsMid('../../support/MockBinder') ]
		});
		var testMethodRan = false;
		var testMethodOriginal = MockBinder.test;

		MockBinder.test = function (kwArgs:bindingInterface.IBindingArguments):boolean {
			testMethodRan = true;
			return true;
		}

		try {
			binder.run().then(function () {
				binder.test({
					source: {},
					sourcePath: 'a',
					target: {},
					targetPath: 'a'
				});
			});
		}
		finally {
			MockBinder.test = testMethodOriginal;
		}

		assert.isTrue(testMethodRan, 'Constructor module should have been loaded and had its \'test\' method invoked.');
	},

	'#test'() {
		var binder = new Binder({
			constructors: [ MockBinder ]
		});

		assert.isTrue(binder.test({
			source: {
				test: true
			},
			sourcePath: 'a',
			target: {
				test: true
			},
			targetPath: 'a'
		}));

		assert.isFalse(binder.test({
			source: {
				test: false
			},
			sourcePath: 'a',
			target: {
				test: true
			},
			targetPath: 'a'
		}));

		assert.isFalse(binder.test({
			source: {
				test: true
			},
			sourcePath: 'a',
			target: {
				test: false
			},
			targetPath: 'a'
		}));
	},

	'#createBinding': {
		simple() {
			var obj = {
				foo: 'bar',
				test: true
			};
			var binder = new Binder({
				constructors: [ MockBinder ]
			});
			var binding = binder.createBinding(obj, 'foo');

			assert.strictEqual((<any> binding).kwArgs.object, obj);
			assert.strictEqual((<any> binding).kwArgs.path, 'foo');
			assert.strictEqual((<any> binding).kwArgs.binder, binder);
		},

		'no binding constructor'() {
			var obj = {
				foo: 'bar',
				test: true
			};
			var binder = new Binder({ constructors: [] });

			function createBinding() {
				binder.createBinding(obj, 'foo');
			}

			assert.throws(createBinding, BindingError);
		},

		'observe, notify, binding.destroy'() {
			var obj = {
				foo: 'bar',
				test: true
			};
			var binder = new Binder({
				constructors: [ MockBinder ]
			});
			var binding = binder.createBinding(obj, 'foo');
			var originalObserve = MockBinder.prototype.observe;
			var originalNotify = MockBinder.prototype.notify;
			var observeCalled = false;
			var notifyCalled = false;

			MockBinder.prototype.observe = <any> function () {
				observeCalled = true;
				return {
					remove: function () {}
				};
			};

			MockBinder.prototype.notify = <any> function () {
				notifyCalled = true;
			};

			try {
				// The binding returned by 'createBinding' may be a delegated object with its own 'observe' method, or
				// a plain instance of one of the Binder's Binding constructors - in either case, the 'observe' method
				// should be called
				binding.observe(function () {});
				assert.isTrue(observeCalled, 'binding\'s observe method should have been called');

				// Calling 'notify' on the Binder should route through the relevant Binding instance's 'notify' method
				binder.notify(obj, 'foo', {});
				assert.isTrue(notifyCalled, 'binding\'s notify method should have been called');

				// TODO: <any> casting: the IBinding interface does not define any params for destroy method;
				// the object returned by Binder.createBinding has a destroy method that accepts a param
				// TODO: should we test 'observe' on a destroyed binding? (current behavior = throw error)
				(<any> binding).destroy(true);
				notifyCalled = false;
				binder.notify(obj, 'foo', {});
				assert.isFalse(notifyCalled, 'notifications should not be called on a destroyed binding');
			}
			finally {
				MockBinder.prototype.observe = originalObserve;
				MockBinder.prototype.notify = originalNotify;
			}
		}
	}
});
