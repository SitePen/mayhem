import assert = require('intern/chai!assert');
import BindDirection = require('mayhem/binding/BindDirection');
import Binder = require('mayhem/binding/Binder');
import Binding = require('mayhem/binding/Binding');
import BindingError = require('mayhem/binding/BindingError');
import bindingInterface = require('mayhem/binding/interfaces');
import has = require('mayhem/has');
import MockBinder = require('../../support/MockBinder');
import Observable = require('mayhem/Observable');
import ObservableBinding = require('mayhem/binding/bindings/ObservableBinding');
import registerSuite = require('intern!object');

class SomeObservable extends Observable {
	foo:string;
	bar:string;
}

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

		'notify, binding.observe, binding.destroy'() {
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
			}
			finally {
				MockBinder.prototype.observe = originalObserve;
				MockBinder.prototype.notify = originalNotify;
			}
		}
	},

	observe() {
		var obj = {
			foo: 'bar',
			test: true
		};
		var binder = new Binder({
			constructors: [ MockBinder ]
		});
		var observeCalled = false;
		var originalObserve = MockBinder.prototype.observe;
		var handle:IHandle;

		MockBinder.prototype.observe = <any> function () {
			observeCalled = true;
			return {
				remove: function () {}
			};
		};

		try {
			handle = binder.observe(obj, 'foo', function () {});
			assert.isTrue(observeCalled, 'binding\'s observe method should have been called');
		}
		finally {
			MockBinder.prototype.observe = originalObserve;
		}
	},

	bind() {
		var binder = new Binder({
			constructors: [ ObservableBinding ]
		});
		var sourceObject = new SomeObservable();
		var targetObject = new SomeObservable();
		var handle = binder.bind({
			source: sourceObject,
			sourcePath: 'foo',
			target: targetObject,
			targetPath: 'bar'
		});

		sourceObject.set('foo', 'test1');
		assert.strictEqual(sourceObject.get('foo'), targetObject.get('bar'),
			'bound property values should be the same');

		targetObject.set('bar', 'test2');
		assert.strictEqual(sourceObject.get('foo'), targetObject.get('bar'),
			'bound property values should be the same');

		sourceObject = new SomeObservable();
		handle.setSource(sourceObject);
		sourceObject.set('foo', 'test3');
		assert.strictEqual(sourceObject.get('foo'), targetObject.get('bar'),
			'bound property values should be the same');

		handle.setSource(sourceObject, 'bar');
		sourceObject.set('bar', 'test4');
		assert.strictEqual(sourceObject.get('bar'), targetObject.get('bar'),
			'bound property values should be the same');

		targetObject = new SomeObservable();
		handle.setTarget(targetObject);
		targetObject.set('bar', 'test5');
		assert.strictEqual(sourceObject.get('bar'), targetObject.get('bar'),
			'bound property values should be the same');

		handle.setTarget(targetObject, 'foo');
		targetObject.set('foo', 'test6');
		assert.strictEqual(sourceObject.get('bar'), targetObject.get('foo'),
			'bound property values should be the same');

		handle.setDirection(BindDirection.ONE_WAY);
		targetObject.set('foo', 'test7');
		assert.notStrictEqual(sourceObject.get('bar'), targetObject.get('foo'),
			'target to source binding should no longer be active');

		handle.setDirection(BindDirection.TWO_WAY);
		targetObject.set('foo', 'test8');
		assert.strictEqual(sourceObject.get('bar'), targetObject.get('foo'),
			'bound property values should be the same');

		handle.remove();
		sourceObject.set('bar', 'test9');
		assert.notStrictEqual(sourceObject.get('bar'), targetObject.get('foo'),
			'binding should no longer be active');

		targetObject.set('foo', 'test10');
		assert.notStrictEqual(sourceObject.get('bar'), targetObject.get('foo'),
			'binding should no longer be active');
	}
});
