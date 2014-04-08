/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import registerSuite = require('intern!object');
import domConstruct = require('dojo/dom-construct');
import ElementRenderer = require('../../../ui/dom/_Element');
import WidgetRenderer = require('../../../ui/dom/Widget');
import Widget = require('../../../ui/Widget');
import Container = require('../../../ui/Container');
import declare = require('dojo/_base/declare');
import util = require('../util');
import domUtil = require('../../../ui/dom/util');

var parentNode:Node,
	widget:any,
	renderer:any

function getChildren(widget:any) {
	var parent:any = widget instanceof Widget ? widget._outerFragment : widget,
		children:any[] = [];
	for (var i = 0; i < parent.childNodes.length; i++) {
		children.push(parent.childNodes[i]);
	}
	return children;
}

function createFragment(content:any) {
	var fragment = document.createDocumentFragment();
	if (typeof content === 'string') {
		content = domUtil.toDom(content);
	}
	fragment.appendChild(content);
	return fragment;
}


registerSuite({
	name: 'ui/dom/_Element',

	setup() {
		Widget.prototype._renderer = new ElementRenderer();
	},

	teardown() {
		Widget.prototype._renderer = undefined;
	},

	beforeEach() {
	    widget = new Widget();
		renderer = widget._renderer;
	},

	afterEach() {
	    widget = util.destroy(widget);
		renderer = null;
	},

	'#add': function () {
		var widgets:any[] = [
				new Widget(),
				new Widget(),
				new Widget(),
				new Widget(),
			];

		renderer.add(widget, widgets[0]);
		assert.deepEqual(getChildren(widget), [
			widgets[0]._outerFragment
		], 'Widget should contain fragment for widget 0');

		renderer.add(widget, widgets[1]);
		assert.deepEqual(getChildren(widget), [
			widgets[0]._outerFragment,
			widgets[1]._outerFragment
		], 'Widget should contain fragments for widgets 0 and 1');

		renderer.add(widget, widgets[2], widgets[1]);
		assert.deepEqual(getChildren(widget), [
			widgets[0]._outerFragment,
			widgets[2]._outerFragment,
			widgets[1]._outerFragment
		], 'Widget should contain fragments for widgets 0, 2, and 1');

		renderer.add(widget, widgets[3], widgets[2]._outerFragment);
		assert.deepEqual(getChildren(widget), [
			widgets[0]._outerFragment,
			widgets[3]._outerFragment,
			widgets[1]._outerFragment
		], 'widgets[2] fragment should have been replaced by widgets[3] fragment');
	},

	'#attachContent': function () {
		var widget:any = new Widget();

		// give the widget some test content
		var content:Node = domUtil.toDom('<h1>foo</h1>');
		widget._innerFragment = content;

		// attach the content to this renderer
		renderer.attachContent(widget);

		assert.deepEqual(getChildren(widget), [
			content
		], 'Widget children should include content');
	},

	'#attachStyles': function () {
		var widget:any = new Widget();
		renderer.attachStyles(widget);

		widget.get('classList').set('foo', 'bar');
		assert.strictEqual(widget._outerFragment.className, 'foo', 'classname should have been set');

		widget.get('style').set('margin', '10px');
		assert.strictEqual(widget._outerFragment.style.margin, '10px', 'Widget node style should have been set');
	},

	'#clear': function () {
		widget._outerFragment.innerHTML = '<div></div>';
		widget._innerFragment = document.createElement('div');
		renderer.clear(widget);
		assert.strictEqual(widget._outerFragment.innerHTML, '', 'outerFragment should be empty')
		assert.isNull(widget._innerFragment, 'innerFragment should be null')
	},

	'#detach': function () {
		var node = widget._outerFragment,
			parent = document.createElement('div');
		parent.appendChild(node);
		renderer.detach(widget);
		assert.strictEqual(parent.childNodes.length, 0, 'fragment should have been removed from parent');

		assert.doesNotThrow(function () {
			renderer.detach(widget);
		}, 'detaching widget with no parent should not throw');
	},

	'#detachContent': function () {
		var node1 = document.createElement('ul'),
			node2 = document.createElement('ol'),
			outerChildren = getChildren(widget._outerFragment);
		widget._outerFragment.appendChild(node1);
		widget._outerFragment.appendChild(node2);
		renderer.detachContent(widget);
		assert.deepEqual(getChildren(widget._outerFragment), outerChildren, 'outerFragment should be empty')
		assert.deepEqual(getChildren(widget._innerFragment), [ node1, node2 ],
			'outerFragment content should have been moved to innerFragment')
	},

	'#render': function () {
		var widget:any = {};
		renderer.render(widget);
		assert.property(widget, '_firstNode', 'widget should have _firstNode');
		assert.property(widget, '_lastNode', 'widget should have _firstNode');
		assert.property(widget, '_outerFragment', 'widget should have _outerFragment');

		widget = { _outerFragment: true };
		assert.doesNotThrow(function () {
			renderer.render(widget);
		}, 'Rendering a widget with an outerFragment but no parent should not throw');


		var node = document.createElement('div'),
			parent = document.createElement('div');
		parent.appendChild(node);
		widget = { _outerFragment: node };
		renderer.render(widget);
		assert.notEqual(widget._outerFragment, node, 'Widget node should have been replaced');
		assert.deepEqual(getChildren(parent), [ widget._outerFragment ],
			'Parent should only contain new widget fragment');
	},

	'#setContent': function () {
		var widget:any = { _outerFragment: {} };
		renderer.setContent(widget, '<span></span>');
		assert.propertyVal(widget._outerFragment, 'innerHTML', '<span></span>',
			'Content should have been assigned to widget fragment innerHTML');

		var content = document.createElement('div');
		widget = { _outerFragment: document.createElement('div') };
		renderer.setContent(widget, content);
		assert.deepEqual(getChildren(widget._outerFragment), [ content ],
			'Content node should be only child of widget fragment');
	}
});
