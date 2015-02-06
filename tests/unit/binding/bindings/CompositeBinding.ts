import assert = require('intern/chai!assert');
import Binder = require('mayhem/binding/Binder');
import bindingInterface = require('mayhem/binding/interfaces');
import CompositeBinding = require('mayhem/binding/bindings/CompositeBinding');
import ObservableBinding = require('mayhem/binding/bindings/ObservableBinding');
import Observable = require('mayhem/Observable');
import registerSuite = require('intern!object');

class SomeObservable extends Observable {
	get:SomeObservable.Getters;
}

module SomeObservable {
	export interface Getters extends Observable.Getters {
		(key:'foo'):string;
	}
}
var binding:CompositeBinding;

registerSuite({
	name: 'mayhem/binding/bindings/CompositeBinding',

	'.test'() {
		// TODO: remove <any> casts when composite type support is added (TS 1.4?)
		assert.isTrue(CompositeBinding.test(<any> { object: {}, path: [], binder: null }));
		assert.isFalse(CompositeBinding.test(<any> { object: null, path: [], binder: null }));
		assert.isFalse(CompositeBinding.test({ object: {}, path: 'not an array', binder: null }));
	},

	bind() {
		var sourceObject = new SomeObservable();
		var anotherSource = new SomeObservable();
		var targetObject = new SomeObservable();
		var binder = new Binder({
			constructors: [ CompositeBinding, ObservableBinding ]
		});
		// TODO: remove <any> casts when composite type support is added (TS 1.4?)
		var handle = binder.bind(<any> {
			source: sourceObject,
			sourcePath: [
				'foo ',
				{
					path: 'foo'
				},
				' bar ',
				{
					object: anotherSource,
					path: 'bar'
				}
			],
			target: targetObject,
			targetPath: 'foo'
		});

		sourceObject.set('foo', 'abc');
		assert.strictEqual(targetObject.get('foo'), 'foo abc bar ');

		anotherSource.set('bar', 'xyz');
		assert.strictEqual(targetObject.get('foo'), 'foo abc bar xyz');

		handle.remove();
		sourceObject.set('foo', 'AAA');
		assert.notInclude(targetObject.get('foo'), 'AAA', 'unbound target should no longer receive updates');
		anotherSource.set('bar', 'BBB');
		assert.notInclude(targetObject.get('foo'), 'BBB', 'unbound target should no longer receive updates');
	}
});
