/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import Binder = require('../../../binding/Binder');
import Binding = require('../../../binding/Binding');
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

	'#createBinding'() {
		var obj = {
			foo: 'bar',
			test: true
		};
		var binder = new Binder({
			constructors: [ MockBinder ]
		});
		var binding = binder.createBinding(obj, 'foo');

		assert.strictEqual(binding.kwArgs.object, obj);
		assert.strictEqual(binding.kwArgs.path, 'foo');
		assert.strictEqual(binding.kwArgs.binder, binder);
	}
});
