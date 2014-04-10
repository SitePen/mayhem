/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import registerSuite = require('intern!object');
import domConstruct = require('dojo/dom-construct');
import WidgetRenderer = require('../../../ui/dom/Widget');
import Widget = require('../../../ui/Widget');
import Container = require('../../../ui/Container');
import declare = require('dojo/_base/declare');
import util = require('../support/util');
import domUtil = require('../../../ui/dom/util');

var parentNode:Node,
	renderer:any;

function getChildren(widget:any) {
	var parent:any = widget instanceof Widget ? widget._firstNode.parentNode : widget,
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
	name: 'ui/dom/Widget',

	setup() {
		Widget.prototype._renderer = new WidgetRenderer();
	},

	teardown() {
		Widget.prototype._renderer = undefined;
	},

	beforeEach() {
	    renderer = new WidgetRenderer();
	},

	afterEach() {
		renderer = util.destroy(renderer);
	},

	'#add': function () {
		var widget:any = new Widget(),
			newWidget1:any = new Widget(),
			newWidget2:any = new Widget(),
			newWidget3:any = new Widget(),
			newWidget4:any = new Widget();

		renderer.add(widget, newWidget1);
		assert.deepEqual(getChildren(widget), [
			widget._firstNode,
			newWidget1._firstNode,
			newWidget1._lastNode,
			widget._lastNode
		], 'Widget should contain newWidget1 nodes');

		renderer.add(widget, newWidget2);
		assert.deepEqual(getChildren(widget), [
			widget._firstNode,
			newWidget1._firstNode,
			newWidget1._lastNode,
			newWidget2._firstNode,
			newWidget2._lastNode,
			widget._lastNode
		], 'Widget should contain newWidget2 nodes');

		renderer.add(widget, newWidget3, newWidget2);
		assert.deepEqual(getChildren(widget), [
			widget._firstNode,
			newWidget1._firstNode,
			newWidget1._lastNode,
			newWidget3._firstNode,
			newWidget3._lastNode,
			newWidget2._firstNode,
			newWidget2._lastNode,
			widget._lastNode
		], 'Widget should contain newWidget3 nodes');

		renderer.add(widget, newWidget4, newWidget3._firstNode);
		assert.deepEqual(getChildren(widget), [
			widget._firstNode,
			newWidget1._firstNode,
			newWidget1._lastNode,
			newWidget4._firstNode,
			newWidget4._lastNode,
			newWidget3._lastNode,
			newWidget2._firstNode,
			newWidget2._lastNode,
			widget._lastNode
		], 'newWidget3 _firstNode should have been replace by newWidget4 nodes');
	},

	'#attachContent': function () {
		var widget:any = new Widget();

		// give the widget some test content
		var content:Node = domUtil.toDom('<h1>foo</h1>');
		widget._innerFragment = content;

		assert.deepEqual(getChildren(widget), [
			widget._firstNode,
			widget._lastNode
		], 'Widget children should be firstNode and lastNode');

		// attach the content to this renderer
		renderer.attachContent(widget);

		assert.deepEqual(getChildren(widget), [
			widget._firstNode,
			content,
			widget._lastNode
		], 'Widget children should include content');
	},

	'#attachStyles': function () {
		var widget:any = new Widget(),
			action:any = [];

		renderer.attachStyles(widget);

		aspect.before(renderer, 'detachContent', function (widget:any) {
			action.push([ 'detached', widget ]);
		});
		aspect.before(renderer, 'attachContent', function (widget:any) {
			action.push([ 'attached', widget ]);
		});

		widget.get('style').set('margin', 0);
		assert.deepEqual(action, [], 'Widget should not have been detached or attached');

		widget.get('style').set('display', 'none');
		assert.deepEqual(action, [ [ 'detached', widget ] ], 'Widget should have been detached');

		action = [];
		widget.get('style').set('display', '');
		assert.deepEqual(action, [ [ 'attached', widget ] ], 'Widget should have been attached');
	},

	'#attachToWindow': function () {
		var target = document.createElement('div'),
			widget:any = new Widget();
		renderer.attachToWindow(widget, target);
		assert.deepEqual(getChildren(target), [ widget._firstNode, widget._lastNode ]);
	},

	'#clear': function () {
		var container:any = new Container(),
			widget1:any = new Widget(),
			widget2:any = new Widget(),
			widget3:any = new Widget();

		container.add(widget1);
		container.add(widget2);
		renderer.add(container, widget3);
		assert.deepEqual(getChildren(container._firstNode.parentNode), [
			container._firstNode,
			widget1._firstNode, widget1._lastNode,
			widget2._firstNode, widget2._lastNode,
			widget3._firstNode, widget3._lastNode,
			container._lastNode
		], 'Container should have expected children');

		renderer.clear(container);
		assert.deepEqual(getChildren(container._firstNode.parentNode), [
			container._firstNode,
			container._lastNode
		], 'Container should no child nodes');
	},

	'#detach': function () {
		var widget:any = new Widget(); 
		renderer.detach(widget);
		assert.deepEqual(getChildren(widget._outerFragment), [ widget._firstNode, widget._lastNode ],
			'Widget child nodes should have been moved to _outerFragment');

		// check that widget will remake its _outerFragment if necessary
		renderer.attachContent(widget);
		widget._outerFragment = null;
		renderer.detach(widget);
		assert.deepEqual(getChildren(widget._outerFragment), [ widget._firstNode, widget._lastNode ],
			'Widget child nodes should have been moved to _outerFragment');
	},

	'#detachChildren': function () {
		var container:any = new Container(),
			widget1:any = new Widget(),
			widget2:any = new Widget(),
			content1 = domUtil.toDom('<h1>foo</h1>'),
			content2 = domUtil.toDom('<h1>bar</h1>');

		renderer.setContent(widget1, content1),
		renderer.setContent(widget2, content2),

		container.add(widget1);
		container.add(widget2);

		assert.deepEqual(getChildren(container._firstNode.parentNode), [
			container._firstNode,
			widget1._firstNode, content1, widget1._lastNode,
			widget2._firstNode, content2, widget2._lastNode,
			container._lastNode
		], 'Container should have expected children');

		// detaching children means to call detach on each child (not detach all the children from the parent)
		renderer.detachChildren(container);
		assert.deepEqual(getChildren(container), [
			container._firstNode,
			widget1._firstNode, widget1._lastNode,
			widget2._firstNode, widget2._lastNode,
			container._lastNode
		], 'Container should have no child nodes');
	},

	'#detachContent': function () {
		var widget:any = new Widget();
		renderer.setContent(widget, '<h1>foo</h1>');
		renderer.detachContent(widget);
		assert.deepEqual(getChildren(widget), [
			widget._firstNode, widget._lastNode
		], 'Widget should have no child nodes');
		assert.isNotNull(widget._innerFragment, 'Widget inner fragment should not be null');
	},

	'#destroy': function () {
		var widget:any = new Widget();
		renderer.setContent(widget, '<h1>foo</h1>');
		renderer.destroy(widget);
		assert.isNull(widget._classListHandle, '_classListHandle should be null');
		assert.isNull(widget._styleHandle, '_styleHandle should be null');
		assert.isNull(widget._innerFragment, '_innerFragment should be null');
		assert.isNull(widget._firstNode, '_firstNode should be null');
		assert.isNull(widget._lastNode, '_lastNode should be null');
	},

	'#remove': function () {
		var widget:any = new Widget();
		renderer.remove(null, widget);
		assert.deepEqual(getChildren(widget._outerFragment), [ widget._firstNode, widget._lastNode ],
			'Widget child nodes should have been moved to _outerFragment');
	}
});
