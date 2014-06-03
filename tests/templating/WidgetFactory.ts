/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import WidgetFactory = require('../../templating/WidgetFactory');
import Observable = require('../../Observable');
import ContentView = require('../../ui/ContentView');
import Widget = require('../../ui/Widget');
import Button = require('../../ui/form/Button');

registerSuite({
	name: 'templating/WidgetFactory',

	setup() {
		Widget.prototype._renderer = <any> {
			initialize() {},
			render() {},
			setContent() {}
		}
	},

	teardown() {
		Widget.prototype._renderer = undefined;
	},

	'#create': function () {
		var factory = new WidgetFactory({
			constructor: 'mayhem/ui/ContentView',
			children: [
				{ constructor: 'mayhem/ui/form/Button' }
			],
			content: [ '<h1>Testing</h1>' ]
		});
		assert.property(factory.content, 'nodeType', 'Content node should have been created in factory');
		assert.strictEqual(factory.content['innerText'], 'Testing', 'Content node should have correct text content');

		var widget = factory.create();
		assert.instanceOf(widget, ContentView, 'Widget should have been created');
		assert.strictEqual((<any> widget.get('children')).length, 1, 'Widget should have 1 child');
		assert.doesNotThrow(function () { widget.destroy(); }, 'Destroy should not throw');
		assert.doesNotThrow(function () { widget.destroy(); }, 'Destroying a second time should not throw');

		// will have child marker nodes
		factory = new WidgetFactory({
			constructor: 'mayhem/ui/ContentView',
			kwArgs: {
				title: 'Simple widget',
				selected: true
			},
			children: [
				{ constructor: 'mayhem/ui/form/Button' }
			],
			content: [
				'<h1>Testing</h1>',
				{ $child: 0 },
				{ $named: 'title' }
			]
		});
		// currently broken due to issue with DOM node placement
		var widget = factory.create();
		assert.instanceOf(widget, ContentView, 'Widget should have been created');
		assert.strictEqual((<any> widget.get('children')).length, 1, 'Widget should have 1 child');
		assert.instanceOf((<any> widget.get('children'))[0], Button, 'Widget child should be a Widget');

		assert.doesNotThrow(function () {
			widget.destroy();
		}, 'Destroy with placeholder should not throw');
	},

	'#destroy': function () {
		var factory = new WidgetFactory({
			constructor: 'mayhem/ui/ContentView',
		});

		assert.doesNotThrow(function () {
			factory.destroy();
		}, 'Destroying a widget factory should not throw');
	},

	'bindings': function () {
		var factory = new WidgetFactory({
			constructor: 'mayhem/ui/ContentView',
			kwArgs: {
				region: { $bind: 'region' },
				name: { $bind: [ { $bind: 'first' }, ' ', { $bind: 'last' } ] },
				innerContent: { 
					constructor: 'mayhem/ui/ContentView'
				}
			},
			content: [
				'<div>', { $bind: 'title' }, '</div>'
			]
		});
		assert.isDefined(factory.propertyBindings['region'], 'Factory should have bindings');

		// bindings in kwArgs are bound to the widget
		// bindings in content are bound to content widgets or directly to text nodes

		var targetValue:any,
			target:any,
			app = new Observable({
				binder: {
					bind: function (args:any) {
						args.source.observe(args.sourceBinding, function (newVal:any, oldVal:any, key:string) {
							target = args.target;
							targetValue = newVal;
							if (target.set) {
								target.set(args.targetBinding, newVal);
							}
							else {
								target[args.targetBinding] = newVal;
							}
						});
					}
				}
			}),
			mediator = new Observable(),
			widget = factory.create();

		widget.set('app', app);
		widget.set('mediator', mediator);

		// check that bindings have actually been established
		mediator.set('title', 'foo');
		assert.property(target, 'nodeType', 'Target should be a node');
		assert.strictEqual(targetValue, 'foo', 'Target value should get mediator value');

		mediator.set('region', 'center');
		assert.strictEqual(target, widget, 'Target should be the widget');
		assert.strictEqual(widget.get('region'), 'center', 'Target value should get widget property value');

		mediator.set('first', 'Bob');
		assert.strictEqual(widget.get('name'), 'Bob ', 'Widget "name" property should have only first name');
		mediator.set('last', 'Smith');
		assert.strictEqual(widget.get('name'), 'Bob Smith', 'Widget "name" property should have first and last name');
		mediator.set('first', 'Sam');
		assert.strictEqual(widget.get('name'), 'Sam Smith', 'Widget "name" property should have new first name');
	},

	'construct with non-Widget': function () {
		assert.throws(function () {
			var factory = new WidgetFactory({
				constructor: 'mayhem/templating/WidgetFactory'
			});
		}, /Invalid widget constructor provided/, 'WidgetFactory should throw when trying to use a non-Widget');

		assert.throws(function () {
			var factory = new WidgetFactory({ constructor: 'mayhem/ui/ContentView' }, <any> WidgetFactory);
		}, /Invalid widget constructor provided/, 'WidgetFactory should throw when trying to use a non-Widget');
	},

	/*
	'construct with unloaded module': function () {
		assert.throws(function () {
			var factory = new WidgetFactory({
				constructor: 'mayhem/ui/FooContainer',
			});
		}, /Attempt to require unloaded module/, 'WidgetFactory should throw when using a widget that has not already been loaded');
	}*/
});
