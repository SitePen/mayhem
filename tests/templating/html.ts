/// <reference path="../intern" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Template = require('../../templating/html');

registerSuite({
	name: 'templating/html',

	'#parse simple': function () {
		var tree = Template.parse('<widget is="foo" status="good" name="{name}"><div>{title}</div></widget>');

		// single widget template is collapsed into a View
		assert.propertyVal(<any> tree, 'constructor', 'framework/templating/ui/View',
			'Tree should have constructor property with proper type');

		assert.deepEqual(tree['content'], [ '<div>', { $bind: 'title' }, '</div>' ],
			'Content should have expected structure');

		assert.deepEqual(tree['kwArgs'], { 'status': 'good', 'name': { $bind: [ { $bind: 'name' } ] } },
			'kwArgs should have expected structure');
	},

	'#parse': function () {
		var tree = Template.parse('<widget is="framework/ui/form/Textarea" value="{firstName} {lastName}"></widget>\n' +
			'First Name: <widget is="framework/ui/form/TextInput" value={firstName} label={firstName}></widget>\n' +
			'<widget is="framework/ui/form/Error" binding="firstName"></widget>\n' +
			'Last Name: <widget is="framework/ui/form/TextInput" value={lastName}></widget>\n' +
			'<widget is="framework/ui/form/Error" binding="lastName"></widget>\n' +
			'fullName bound input: <widget is="framework/ui/form/TextInput" value={fullName}></widget>');

		assert.strictEqual(tree['children'].length, 6, 'Tree should have 6 child widgets');
		assert.strictEqual(tree['content'].length, 11, 'Tree content should have 11 elements');
		assert.deepEqual(tree['content'][0], { $child: 0 }, 'First content element should refer to first child')

		assert.deepEqual(tree['children'][0], {
			constructor: 'framework/ui/form/Textarea',
			kwArgs: {
				value: {
					$bind: [ { $bind: 'firstName' }, ' ', { $bind: 'lastName' } ]
				}
			}
		}, 'First child should have expected structure');
	},

	'#normalize': function () {
		var normalized:string;
		Template.normalize('foo/bar', function (id) {
			return normalized = id;
		});
		assert.strictEqual(normalized, 'foo/bar.html', 'Path should be normalized');
	}
});