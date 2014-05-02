/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import registerSuite = require('intern!object');
import View = require('../../ui/View');
import Widget = require('../../ui/Widget');
import ui = require('../../ui/interfaces');
import MockWidget = require('../mocks/ui/Widget');
import MockRenderer = require('../mocks/ui/Renderer');
import Observable = require('../../Observable');

var view:View,
	app:any;

function createParent() {
	var parent:any = new Observable();
	parent.remove = function (child:any) {
		parent.set('_removed', child);
	}
	return parent;
}

registerSuite({
	name: 'ui/View',

	setup() {
		Widget.prototype._renderer = <any> new MockRenderer();
	},

	teardown() {
		Widget.prototype._renderer = undefined;
	},

	beforeEach() {
		view = new View();
		app = new Observable({
			binder: {
				bind(args:any) {
					app.set('bindingArgs', args);
					app.set('source', args.source);
					return {
						remove() {
							app.set('bindingRemoved', true);
						},
						setSource(source:any) {
							app.set('source', source);
						}
					}
				}
			},
			bindingRemoved: false

		});
	},

	afterEach() {
		app = null;
		if (view) {
			try {
				view.destroy();
			} catch (e) {
				// ignored
			}
			view = null;
		}
	},

	'#bind': function () {
		var model = new Observable();

		var handle = view.bind(<any> {
			sourceBinding: 'foo',
			targetBinding: 'bar'
		});

		assert.isUndefined(app.get('bindingArgs'), 'Binding should not have been created with no app or model');

		view.set('app', app);
		assert.isUndefined(app.get('bindingArgs'), 'Binding should not have been created with no model');

		view.set('model', model);
		assert.propertyVal(app.get('bindingArgs'), 'sourceBinding', 'foo', 'Binding should have been created');

		handle.remove();
		assert.isTrue(app.get('bindingRemoved'), 'Binding should have been removed');

		//
		// Remove handle from incomplete binding
		//

		view.set('model', null);
		app.set('bindingArgs', null);
		app.set('bindingRemoved', false);

		handle = view.bind(<any> {
			sourceBinding: 'foo',
			targetBinding: 'bar'
		});
		assert.isNull(app.get('bindingArgs'), 'Binding should not have been created');
		handle.remove();
		view.set('model', model);
		assert.isNull(app.get('bindingArgs'), 'Binding should not have been completed');
	},

	'#destroy': function () {
		// check that setting model updates bindings

		view.set('app', app);
		view.set('model', new Observable());
		view.bind(<any> {
			sourceBinding: 'foo',
			targetBinding: 'bar'
		});
		view.destroy();
		assert.isTrue(app.get('bindingRemoved'), 'Binding should have been removed');
	},

	'#_modelGetter': function () {
		// TODO: check that view's or view's parent's model is returned
	},

	'observe parent': function () {
		// check that setting parent updates app and model
		var parent = createParent(),
			model1 = new Observable(),
			model2 = new Observable(),
			app2 = new Observable(),
			app3 = new Observable(),
			newModel:any,
			oldModel:any;

		view.observe('model', function (newValue:any, oldValue:any) {
			newModel = newValue;
			oldModel = oldValue;
		});

		view.set('parent', parent);
		assert.strictEqual(view.get('app'), undefined, 'View should not have an app');

		parent.set('app', app);
		assert.strictEqual(view.get('app'), app, 'View should have received parent app');

		parent.set('app', app2);
		assert.strictEqual(view.get('app'), app, 'View should not have received a subsequent parent app');

		parent.set('model', model1)
		assert.strictEqual(view.get('model'), model1, 'View should have received parent model');

		view.set('app', app3);
		parent.set('app', app)
		assert.strictEqual(view.get('app'), app3, 'View should not have received parent app');

		view.destroy();

		view = new View();
		view.observe('model', function (newValue:any, oldValue:any) {
			newModel = newValue;
			oldModel = oldValue;
		});

		view.set('parent', parent);
		view['_model'] = null;
		newModel = oldModel = null;

		view.set('parent', createParent());
		assert.isUndefined(newModel, 'New model should have been undefined');
		assert.strictEqual(oldModel, model1, 'Old model should have been model1');
	},

	'observe model': function () {
		// check that setting model updates bindings
		var model1 = new Observable(),
			model2 = new Observable();

		view.set('app', app);
		view.set('model', model1);
		view.bind(<any> {
			sourceBinding: 'foo',
			targetBinding: 'bar'
		});
		assert.strictEqual(app.get('source'), model1, 'Binding source should have been model1');

		view.set('model', model2);
		assert.strictEqual(app.get('source'), model2, 'Binding source should have been changed to model2');
	}
});
