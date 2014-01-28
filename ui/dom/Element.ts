import util = require('../../util');
import DomContainer = require('./Container');
import domUtil = require('./util');
import MultiNodeWidget = require('./MultiNodeWidget');
import Placeholder = require('./Placeholder');
import PlacePosition = require('../PlacePosition');
import core = require('../../interfaces');
import widgets = require('../interfaces');
import array = require('dojo/_base/array');
import domConstruct = require('dojo/dom-construct');

/**
 * The Element class provides a DOM-specific widget that encapsulates one or more DOM nodes.
 */
class Element extends MultiNodeWidget {

	html:string;
	private _markup:any; // string | binding descriptor
	//bindingPlaceholderMap:{ [key:string]: Placeholder};
	childPlaceholders:Placeholder[] = [];
	children:widgets.IDomWidget[];

	private _htmlSetter(markup:any):void {
		// clear out element and some widget properties
		this.empty();
		this._markup = markup;
		 // TODO: clean up old bindings and children and such
		this.childPlaceholders = [];
		//this.bindingPlaceholderMap = {};

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

		var model = this.get('mediator').model,
			childPlaceholders = this.childPlaceholders;

		// recurse and handle comments standing in for child and binding placeholders
		function processComments(node:Node) {
			var childPattern:RegExp = /^\s*child#(\d+)\s*$/,
				bindingPattern:RegExp = /^\s*placeholder#(\d+)\s*$/,
				parent:Node = node.parentNode,
				next:Node,
				i:number,
				length:number,
				match:string[],
				placeholder:Placeholder,
				fragment:DocumentFragment,
				binding:string;

			// iterate siblings
			while (node != null) {
				// capture next sibling before manipulating dom
				next = node.nextSibling;
				// recursively sweep and process children
				for (i = 0, length = node.childNodes.length; i < length; ++i) {
					processComments(node.childNodes[i]);
				}
				// we only care about comment nodes
				if (node.nodeType == Node.COMMENT_NODE) {
					// test for child comment marker
					match = node.nodeValue.match(childPattern);
					if (match) {
						// create placeholder and add to list
						placeholder = new Placeholder({});
						childPlaceholders[Number(match[1])] = placeholder;
						// replace marker node with placeholder fragment
						fragment = domUtil.getRange(placeholder.firstNode, placeholder.lastNode).extractContents();
						parent.replaceChild(fragment, node);
					}
					// test for binding comment marker
					match = node.nodeValue.match(bindingPattern);
					if (match) {
						placeholder = new Placeholder({});
						binding = markup[match[1]].binding
						//bindingPlaceholderMap[binding] = placeholder;
						// TODO: finish, for now just leaving in the shite implementation


						// TODO: can we use proper bindings here?
						var textNode = document.createTextNode(model.get(binding));
						parent.replaceChild(textNode, node);
						// TODO: drip drip drip...
						var handle = model[binding].observe(function(newValue:any) {
							textNode.nodeValue = newValue;
						});
					}
				}
				node = next;
			}
		}

		// create fragment and process comments before inserting
		var fragment:Node = domConstruct.toDom(this.html);
		processComments(fragment);
		this.lastNode.parentNode.insertBefore(fragment, this.lastNode);
		// refresh placeholders flashing the node structure
		this._refreshChildPlaceholders();
		//this._refreshBindings();
	}

	private _childrenSetter(children:widgets.IDomWidget[]):void {
		this.children = children;
		this._refreshChildPlaceholders();
	}

	private _refreshChildPlaceholders():void {
		// noop if both child placeholders and children aren't set on widget
		if (!this.childPlaceholders || !this.children) return;
		// loop over child placeholders and set to associated child widget
		array.forEach(this.childPlaceholders, (placeholder, i) => {
			placeholder.set('content', this.children[i]);
		});
	}

	// private _refreshBindings():void {
	// 	var model = this.get('mediator').model;

	// 	array.forEach(util.getObjectKeys(this.bindingPlaceholderMap), (binding) => {
	// 		var placeholder = this.bindingPlaceholderMap[binding];
	// 		// TODO
	// 	});
	// }

	destroy():void {
		array.forEach(this.children, function(child) {
			child.destroy();
		});
		this.children = null;
		super.destroy();
	}
}

export = Element;
