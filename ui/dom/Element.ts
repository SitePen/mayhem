
import array = require('dojo/_base/array');
import core = require('../../interfaces');
import domConstruct = require('dojo/dom-construct');
import DomContainer = require('./Container');
import domUtil = require('./util');
import MultiNodeWidget = require('./MultiNodeWidget');
import Placeholder = require('./Placeholder');
import PlacePosition = require('../PlacePosition');
import util = require('../../util');
import Widget = require('../Widget');
import widgets = require('../interfaces');


/**
 * The Element class provides a DOM-specific widget that encapsulates one or more DOM nodes.
 */
class Element extends MultiNodeWidget {

	html:string;
	private _markup:any; // string | binding descriptor
	childPlaceholders:Placeholder[];
	children:widgets.IDomWidget[];

	private _htmlSetter(markup:any):void {
		// Clear out element and some widget properties
		this.empty();
		this._markup = markup;
		 // TODO: Clean up old bindings and children and such
		this.childPlaceholders = [];

		if (typeof markup === 'string') {
			// if markup is a string no need to do any fancy processing
			this.html = markup;
			this.lastNode.parentNode.insertBefore(domConstruct.toDom(markup), this.lastNode);
			return;
		}

		// process and create placeholders for all bindings
		// this should typically be followed by a call to set children
		// TODO: make it so that ordering of set('html') / set('children') is unimportant
		var processed:string[] = array.map(markup, (item:any, i:number) => {
			if (!item.binding) return item;
			// insert comment to mark binding location
			return '<!-- binding#' + i + ' -->';
		});
		this.html = processed.join('');

		var mediator = this.get('mediator'),
			childPlaceholders = this.childPlaceholders;

		function processComment(node:Node) {
			var childPattern:RegExp = /^\s*child#(\d+)\s*$/,
				bindingPattern:RegExp = /^\s*binding#(\d+)\s*$/,
				parent:Node = node.parentNode,
				match:string[],
				placeholder:Placeholder,
				fragment:DocumentFragment,
				binding:string;
			// We only care about comment nodes
			if (node.nodeType !== Node.COMMENT_NODE) return;
			// Test for child comment marker
			match = node.nodeValue.match(childPattern);
			if (match) {
				// Create placeholder and add to list
				placeholder = new Placeholder({});
				childPlaceholders[Number(match[1])] = placeholder;
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

				// TODO: can we use proper bindings here?
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
			var next:Node,
				i:number,
				length:number;
			// Iterate siblings
			while (node != null) {
				// Capture next sibling before manipulating dom
				next = node.nextSibling;
				// Sweep and process children recursively
				for (i = 0, length = node.childNodes.length; i < length; ++i) {
					processChildren(node.childNodes[i]);
				}
				processComment(node);
				node = next;
			}
		}

		// Create fragment and process comments before inserting
		var fragment:Node = domConstruct.toDom(this.html);
		processChildren(fragment);
		this.lastNode.parentNode.insertBefore(fragment, this.lastNode);
		// Refresh placeholders flashing the node structure
		this._refreshChildPlaceholders();
		//this._refreshBindings();
	}

	private _childrenSetter(children:widgets.IDomWidget[]):void {
		this.children = children;
		this._refreshChildPlaceholders();
	}

	private _refreshChildPlaceholders():void {
		// Noop if both child placeholders and children aren't set on widget
		if (!this.childPlaceholders || !this.children) {
			return;
		}
		// Loop over child placeholders and set to associated child widget
		array.forEach(this.childPlaceholders, (placeholder, i) => {
			placeholder.set('content', this.children[i]);
		});
	}

	destroy():void {
		array.forEach(this.children, (child) => child.destroy());
		this.children = null;
		super.destroy();
	}
}

export = Element;
