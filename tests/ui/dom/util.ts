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

function deleteRange() {
	try {
		range.deleteContents();
	}
	finally {
		range = null;
	}
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
		if (range) {
			deleteRange();
		}
		for (var i = 0; i < nodeHandles.length; i++) {
			util.destroy(nodeHandles[i]);
		}
		nodeHandles = [];
	},

	toDom() {
		var node = document.createElement('div');
		assert.strictEqual(domUtil.toDom(node), node, 'toDom should pass through a node');
		assert.instanceOf(domUtil.toDom('div'), Node, 'toDom should create a node from a string');
	},

	getRange() {
		var start = domUtil.toDom('<span>start</span>'),
			end = domUtil.toDom('<span>end</span>');

		// nodes with no parent
		range = domUtil.getRange(start, end);
		assert.strictEqual(range.toString(), 'startend');
		deleteRange();

		// non-exclusive range for nodes with a parent
		start = domUtil.toDom('<span>start</span>');
		end = domUtil.toDom('<span>end</span>');
		appendChild(start);
		appendChild(domUtil.toDom('<span>middle</span>'));
		appendChild(end);
		range = domUtil.getRange(start, end);
		assert.strictEqual(range.toString(), 'startmiddleend');
		deleteRange();

		// exclusive range for nodes with a parent
		start = domUtil.toDom('<span>start</span>');
		end = domUtil.toDom('<span>end</span>');
		appendChild(start);
		appendChild(domUtil.toDom('<span>middle</span>'));
		appendChild(end);
		range = domUtil.getRange(start, end, true);
		assert.strictEqual(range.toString(), 'middle');
		deleteRange();
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
