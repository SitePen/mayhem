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
import Observable = require('../../Observable');

var resolver:Resolver,
	resolverRenderer:any = Resolver.prototype._renderer,
	contentViewRenderer:any = ContentView.prototype._renderer;

registerSuite({
	name: 'ui/Resolver',

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

	'#remove': function () {
		var widget = new Widget(),
			view = resolver.get('success'),
			removed:any;
		aspect.before(view, 'remove', function (item:any) {
			removed = item;
		});
		resolver.add(widget);
		resolver.remove(widget);
		assert.strictEqual(removed, widget, 'Widget should have been removed from success view');

		resolver.remove(view);
		assert.strictEqual(resolver.getChildIndex(view), -1, 'success view should not be a child of widget');
	},

	'#destroy': function () {
		var destroyed = {},
			error = { destroy() {} },
			during = { destroy() {} };

		function checkDestroy(name:string) {
			var w = resolver.get(name); 
			aspect.before(w, 'destroy', function () {
				destroyed[name] = true;
			});
		}

		// check that the success widget is destroyed in a new resolver
		checkDestroy('success');
		assert.doesNotThrow(function () {
			resolver.destroy();
		}, 'Destroying a resolver should not throw');
		assert.isTrue(destroyed['success'], 'success should have been destroyed')

		// check that the target promise is cancelled
		var target = {
			cancel() { this._canceled = true; }
		}
		resolver = new Resolver();
		resolver.set('target', target);
		resolver.destroy();
		assert.propertyVal(target, '_canceled', true, 'Target should have been canceled');

		// TODO: assign during and error widgets and destroy with each of them active
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

	'phase observer': function () {
		var during = new Observable({ visible: false }),
			error = new Observable({ visible: false }),
			success = new Observable({ visible: false });
		resolver.set('during', during)
		resolver.set('error', error)
		resolver.set('success', success)

		resolver.set('phase', 'during')
		assert.isTrue(during.get('visible'));
		assert.isFalse(error.get('visible'));
		assert.isFalse(success.get('visible'));

		resolver.set('phase', 'error')
		assert.isFalse(during.get('visible'));
		assert.isTrue(error.get('visible'));
		assert.isFalse(success.get('visible'));

		resolver.set('phase', 'success')
		assert.isFalse(during.get('visible'));
		assert.isFalse(error.get('visible'));
		assert.isTrue(success.get('visible'));
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
	},

	'scopedMediator': function () {
		var mediator = new Observable({ 'foo': 'item foo', 'bar': 'item bar' });
		resolver.set('value', 'foo');
		resolver.set('result', 'baz');
		resolver.set('mediator', mediator);
		var scopedMediator = resolver.get('scopedMediator');

		assert.strictEqual(scopedMediator.get('foo'), 'baz', 'Should have gotten resolver result');
		assert.strictEqual(scopedMediator.get('bar'), 'item bar', 'Should have gotten mediator value');

		scopedMediator.set('foo', 'new foo');
		assert.strictEqual(resolver.get('result'), 'new foo', 'Should have seen new result in resolver');
		scopedMediator.set('bar', 'new bar');
		assert.strictEqual(mediator.get('bar'), 'new bar', 'Should have seen new mediator value');
	}
});
