import array = require('dojo/_base/array');
import core = require('../../interfaces');
import domConstruct = require('dojo/dom-construct');
import DomContainer = require('./Container');
import domUtil = require('./util');
import MultiNodeWidget = require('./MultiNodeWidget');
import Placeholder = require('./Placeholder');
import PlacePosition = require('../PlacePosition');
import util = require('../../util');
import widgets = require('../interfaces');

/**
 * The Element class provides a DOM-specific widget that encapsulates one or more DOM nodes.
 */
class Element extends MultiNodeWidget {

	children:widgets.IDomWidget[];
	html:string;
	private _placeholders:Placeholder[];

	constructor(kwArgs:any) {
		util.deferSetters(this, [ 'html' ], '_render');
		super(kwArgs);
		// TODO: find a better event name
		this.on('childrenChanged', util.debounce(this._refreshPlaceholders));
	}

	private _childrenSetter(children:widgets.IDomWidget[]):void {
		// TODO: destroy all old children that aren't in new children array?
		this.children = children;
		this.emit('childrenChanged');
	}

	destroy():void {
		array.forEach(this.children, (child) => child.destroy());
		this.children = null;
		super.destroy();
	}

	private _htmlSetter(markup:any):void {
		// TODO: clean up old bindings and children and such
		this._placeholders = null;
		this.empty();

		if (typeof markup === 'string') {
			// If markup is a string no need to do any fancy processing
			this.html = markup;
			this.lastNode.parentNode.insertBefore(domConstruct.toDom(markup), this.lastNode);
			return;
		}

		// Process and create placeholders for all bindings
		// This should typically be followed by a call to set children
		// TODO: make it so that ordering of set('html') / set('children') is unimportant
		var processed:string[] = array.map(markup, (item:any, i:number) => {
			if (!item.binding) {
				return item;
			}
			// insert comment to mark binding location
			return '<!-- binding#' + i + ' -->';
		});
		this.html = processed.join('');

		var mediator = this.get('mediator'),
			placeholders = this._placeholders = [];

		// We inline this function to take advantage of all the variables already closure captured
		function processComment(node:Node) {
			var childPattern:RegExp = /^\s*child#(\d+)\s*$/,
				bindingPattern:RegExp = /^\s*binding#(\d+)\s*$/,
				parent:Node = node.parentNode,
				match:string[],
				placeholder:Placeholder,
				fragment:DocumentFragment,
				binding:string;
			// We only care about comment nodes
			if (node.nodeType !== Node.COMMENT_NODE) {
				return;
			}
			// Test for child comment marker
			match = node.nodeValue.match(childPattern);
			if (match) {
				// Create placeholder and add to list
				placeholder = new Placeholder({});
				placeholders[Number(match[1])] = placeholder;
				// Replace marker node with placeholder fragment
				fragment = domUtil.getRange(placeholder.firstNode, placeholder.lastNode).extractContents();
				parent.replaceChild(fragment, node);
				return;
			}
			// Test for binding comment marker
			match = node.nodeValue.match(bindingPattern);
			if (match) {
				placeholder = new Placeholder({});
				binding = markup[match[1]].binding;
				var textNode = document.createTextNode(mediator.get(binding));
				parent.replaceChild(textNode, node);
				// TODO: drip drip drip...
				var handle = mediator.observe(binding, (newValue:any) => {
					textNode.nodeValue = newValue;
				});
				return;
			}
		}

		// Recurse and handle comments standing in for child and binding placeholders
		function processChildren(node:Node) {
			var next:Node;
			// Iterate siblings
			while (node != null) {
				// Capture next sibling before manipulating dom
				next = node.nextSibling;
				// Sweep and process children recursively
				for (var i = 0, length = node.childNodes.length; i < length; ++i) {
					processChildren(node.childNodes[i]);
				}
				processComment(node);
				node = next;
			}
		}

		// We need to get a fragment from our markup and process its comments before inserting
		var fragment:Node = domConstruct.toDom(this.html);
		processChildren(fragment);
		this.lastNode.parentNode.insertBefore(fragment, this.lastNode);
		this.emit('childrenChanged');
	}

	private _refreshPlaceholders():void {
		// Noop if there are no placeholders or children
		if (!this._placeholders || !this.children) {
			return;
		}
		// Loop over child placeholders and set to associated child widget
		var placeholder:Placeholder,
			child:widgets.IDomWidget;
		for (var i = 0, length = this._placeholders.length; i < length; ++i) {
			placeholder = this._placeholders[i];
			child = this.children[i];
			placeholder.get('content') !== child && placeholder.set('content', child);
		}
	}
}

export = Element;
