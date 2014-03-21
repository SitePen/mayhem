/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import registerSuite = require('intern!object');
import Resolver = require('../../ui/Resolver');
import ContentView = require('../../ui/ContentView');
import Mediator = require('../mocks/data/Mediator');
import Widget = require('../../ui/Widget');
import MockRenderer = require('../mocks/ui/Renderer');
import Deferred = require('dojo/Deferred');

var resolver:Resolver,
	resolverRenderer:any = Resolver.prototype._renderer,
	contentViewRenderer:any = ContentView.prototype._renderer;

registerSuite({
	name: 'ui/dom/Resolver',

	setup() {
		Resolver.prototype._renderer = <any> new MockRenderer();
		ContentView.prototype._renderer = <any> new MockRenderer();
		Widget.prototype._renderer = <any> new MockRenderer();
	},

	teardown() {
		Resolver.prototype._renderer = resolverRenderer;
		ContentView.prototype._renderer = contentViewRenderer;
		Widget.prototype._renderer = undefined;
	},

	beforeEach() {
		resolver = new Resolver();
	},

	afterEach() {
		if (resolver) {
			try {
				resolver.destroy();
			} catch (e) {
				// ignore
			}
			resolver = null;
		}
	},

	'#add': function () {
		var widget = new Widget(),
			view = resolver.get('success'),
			added:any;
		aspect.before(view, 'add', function (item:any) {
			added = item;
		});
		resolver.add(widget);
		assert.strictEqual(added, widget, 'Widget should have been added to success view');
	},

	'#destroy': function () {
		var success = resolver.get('success');
		resolver.destroy();
		assert.isTrue(success._destroyed, 'Success view should have been destroyed');
	},

	'#setContent': function () {
		var widget = new Widget(),
			view = resolver.get('success'),
			content:any;
		aspect.before(view, 'setContent', function (item:any) {
			content = item;
		});
		resolver.setContent(widget);
		assert.strictEqual(content, widget, 'Widget should be set as view content');
	},

	'#_targetSetter': function () {
		var binding:string,
			mediator = {};

		resolver.set('during', new Widget());

		var target:IDeferred<void> = new Deferred<void>();
		resolver.set('target', target);
		assert.strictEqual(resolver.get('phase'), 'during',
			'Widget phase should be "during" when target is unresolved promise');

		var setValues = {};
		aspect.before(resolver, 'set', function (key:string, value:any) {
			setValues[key] = value;
		});

		// resolve target
		// during is detached
		target.resolve('bar');
		assert.deepEqual(setValues, { result: 'bar', phase: 'success' },
			'Expected result and widget to be set after resolving target');

		// progress target
		// success is detached
		target = new Deferred<void>();
		resolver.set('error', new Widget());
		resolver.set('target', target);
		var error = new Error('fail');
		setValues = {};
		target.reject(error);
		assert.deepEqual(setValues, { 'result': error, phase: 'error' },
			'Expected result and widget to be set after erroring target');

		// progress target
		// error is detached
		target = new Deferred<void>();
		resolver.set('target', target);
		var progress = new Widget();
		setValues = {};
		target.progress(progress);
		assert.deepEqual(setValues, { 'result': progress }, 'Expected result to be set after progressing target');
	},
	
	'promise observer': function () {
		var binding:string;
		aspect.before(resolver, 'bind', function (bindingArgs:any) {
			binding = bindingArgs.sourceBinding
		});
		resolver.set('promise', 'foo');
		assert.strictEqual(binding, 'foo', 'Resolver should have created binding for foo');
	},

	'result observer': function () {
		var notification:any;

		aspect.before(resolver, 'set', function (key:string, value:any) {
			if (key === 'scopedMediator') {
				aspect.before(value, '_notify', function (result:any, previous:any, value:any) {
					notification = [ result, previous, value ];
				});
			}
		});
		resolver.set('mediator', {});
		resolver.set('result', 'foo');
		// check that the new mediator was notified when the result was set
		assert.deepEqual(notification, [ 'foo', undefined, resolver.get('value') ]);
	},

	'mediator observer': function () {
		var binding:string,
			mediator:any;

		aspect.before(resolver, 'set', function (key:string, value:any) {
			if (key === 'scopedMediator') {
				mediator = value;
			}
		});

		resolver.set('mediator', {});
		assert.isDefined(mediator, 'New mediator should have been constructed');

		var destroyed = false;
		aspect.before(mediator, 'destroy', function () {
			destroyed = true;
		});
		resolver.set('mediator', {});
		assert.isTrue(destroyed, 'Previous mediator should have been destroyed');

		// mediator._properties.foo = 'value0';
		// mediator._properties.bar = 'value1';

		// var value = newMediator.get('foo');
		// assert.strictEqual(value, 'value0', 'Returned value should be from mediator');

		// // requesting 'foo' on the scoped mediator should cause the reoslver to check its value
		// resolver.set('value', 'bar');
		// resolver.set('result', 'baz');
		// value = newMediator.get('bar');
		// assert.strictEqual(value, 'baz', 'Returned value should be resolver result');

		// // setting an arbitrary key on the scoped mediator should call the mediators setter
		// newMediator.set('alpha', 'value alpha');
		// assert.strictEqual(resolver.get('result'), 'baz', 'Resolver result should be unchanged');

		// // setting the resolver's value key on the scoped mediator should update the resolver's result
		// newMediator.set('bar', 'value bar');
		// assert.strictEqual(resolver.get('result'), 'value bar', 'Resolver should have new result');

		// assert.doesNotThrow(function () {
		// 	resolver.set('mediator')
		// }, 'Should be able to undefine mediator');
	}
});
