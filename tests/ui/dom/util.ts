/// <reference path="../../intern" />

import assert = require('intern/chai!assert');
import aspect = require('dojo/aspect');
import registerSuite = require('intern!object');
import domUtil = require('../../../ui/dom/util');
import domConstruct = require('dojo/dom-construct');
import util = require('../support/util');
import PlacePosition = require('../../../ui/PlacePosition');

var range:any,
	handle:any,
	nodeHandles:any[] = [];

function getChildren(node:Node) {
	var children:Node[] = [];
	for (var i = 0; i < node.childNodes.length; i++) {
		children.push(node.childNodes[i]);
	}
	return children;
}

function appendChild(node:Node) {
	document.body.appendChild(node);

	nodeHandles.push({
		remove() {
			try {
				document.body.removeChild(node);
			} catch (e) {
				// ignore
			}
		}
	});
}

registerSuite({
	name: 'ui/dom/util',

	afterEach() {
		for (var i = 0; i < nodeHandles.length; i++) {
			util.destroy(nodeHandles[i]);
		}
		nodeHandles = [];
	},

	toDom() {
		var node = document.createElement('div');
		assert.strictEqual(domUtil.toDom(node), node, 'toDom should pass through a node');
		assert.property(domUtil.toDom('div'), 'nodeType', 'toDom should create a node from a string');
	},

	extractRange() {
		var start = document.createElement('div'),
			end = document.createElement('div');

		// nodes with no parent
		range = domUtil.extractRange(start, end);
		assert.deepEqual(getChildren(range), [ start, end ]);

		// non-exclusive range for nodes with a parent
		start = document.createElement('div');
		end = document.createElement('div');
		var middle = document.createElement('div');
		appendChild(start);
		appendChild(middle);
		appendChild(end);
		range = domUtil.extractRange(start, end);
		assert.deepEqual(getChildren(range), [ start, middle, end ]);

		// exclusive range for nodes with a parent
		start = document.createElement('div');
		end = document.createElement('div');
		middle = document.createElement('div');
		appendChild(start);
		appendChild(middle);
		appendChild(end);
		range = domUtil.extractRange(start, end, true);
		assert.deepEqual(getChildren(range), [ middle ]);
	},

	deleteRange() {
		var start = document.createElement('div'),
			end = document.createElement('div');

		// deleting elements that aren't in the DOM shouldn't throw
		assert.doesNotThrow(() => domUtil.deleteRange(start, end));

		start = document.createElement('div');
		var middle = document.createElement('div');
		end = document.createElement('div');
		appendChild(start);
		appendChild(middle);
		appendChild(end);
		domUtil.deleteRange(start, end);
		// check for parentElement rather than parentNode for IE8 compatibility
		assert.isNull(start.parentElement);
		assert.isNull(middle.parentElement);
		assert.isNull(end.parentElement);
	},

	place() {
		var args:any;
		handle = aspect.before(domConstruct, 'place', function (node:any, ref:any, position:any) {
			args = [ node, ref, position ];
		});
		var content = '<div></div>',
			ref = document.body.lastChild;

		domUtil.place(content, ref);
		assert.deepEqual(args, [ content, ref, domUtil.PLACE_POSITION_KEYS[PlacePosition.LAST] ]);

		domUtil.place(content, ref, PlacePosition.FIRST);
		assert.deepEqual(args, [ content, ref, domUtil.PLACE_POSITION_KEYS[PlacePosition.FIRST] ]);
	},

	setStyle() {
		var node = document.createElement('div');

		domUtil.setStyle(node, 'margin', '10px');
		assert.strictEqual(node.style.margin, '10px');

		domUtil.setStyle(node, 'margin', 20);
		assert.strictEqual(node.style.margin, '20px');

		domUtil.setStyle(node, 'margin', null);
		assert.strictEqual(node.style.margin, '');
	}
});
