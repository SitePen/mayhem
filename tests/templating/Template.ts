/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import templating = require('../../templating/interfaces');
import Template = require('../../templating/Template');
import JsonTemplate = require('../../templating/json');
import WidgetFactory = require('../../templating/WidgetFactory');
import json = require('dojo/json');

registerSuite({
	name: 'templating/Template',

	'.parse': function () {
		var dfd = this.async(2000);
		require([ 'dojo/text!./data/template.json' ], dfd.callback(function (templateString:string) {
			var templateObj:any = json.parse(templateString),
				tree:any = Template.parse(templateObj);
			// default Template.parse should be a no-op
			assert.deepEqual(tree, templateObj, 'Tree should deepEqual the template object');
		}));
	},

	'.load': function () {
		var dfd = this.async(4000);
		// base Template loads the template data as text and performs no processing, so we have to use a JsonTemplate
		JsonTemplate.load('./data/template3.json', require, dfd.callback(function (factory:any) {
			assert.property(factory, 'create', 'Factory should have a create property');
			assert.property(factory, 'destroy', 'Factory should have a destroy property');
			assert.deepPropertyVal(factory, 'childFactories[0].tree.constructor', 'mayhem/ui/View',
				'Child factory should have expected type');
			assert.deepPropertyVal(factory, 'childFactories[0].childFactories[0].tree.constructor',
				'mayhem/ui/form/Button', 'Child child factory should have expected type');
		}));
	},

	'.scan': function () {
		var dfd = this.async(2000);
		require([ 'dojo/text!./data/template3.json' ], dfd.callback(function (templateString:string) {
			var template:any = json.parse(templateString),
				dependencies = Template.scan(template);
			assert.sameMembers(dependencies, [ 'mayhem/ui/View', 'mayhem/ui/form/Button', 'mayhem/ui/form/Input' ],
				'Dependency list should contain expected constructors');

			var newDependencies = Template.scan(template, [ 'mayhem/ui/View' ]);
			assert.sameMembers(newDependencies, [ 'mayhem/ui/View', 'mayhem/ui/form/Button', 'mayhem/ui/form/Input' ],
				'Dependency list should not contain any duplicate constructors');
		}));
	},

	'.process timeout': function () {
		var dfd = this.async(2000);
		// use a template that with an unloaded widget so the timeout can fire
		require([ 'dojo/text!./data/template2.json' ], function (templateString:string) {
			// need to pre-parse the templateString since the base Template.process method expects an object
			Template.process(json.parse(templateString), 1).then(dfd.rejectOnError(function () {
				assert(false, 'Template processing should have timed out');
			}), dfd.callback(function () {}));
		});
	}
});
