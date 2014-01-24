import DomContainer = require('./Container');
import domUtil = require('./util');
import MultiNodeWidget = require('./MultiNodeWidget');
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
	children:widgets.IDomWidget[];

	constructor(kwArgs:any) {
		// TODO: this is terribly hacky -- a move to the Observable style should improve it
		var newArgs = {};
		for (var key in kwArgs) {
			if (key === 'html' || key === 'children') continue;
			newArgs[key] = kwArgs[key];
		}
		super(newArgs);
		this._setContent(kwArgs.children, kwArgs.html);
	}

	private _setContent(children:widgets.IDomWidget[], fragments:any[]) {
		var processed:string[] = array.map(fragments, function(item:any, i:number) { // FIXME: es5
			if (!item.binding) return item;
			return '<!-- binding#' + i + ' -->';
		});
		this.set('html', processed.join(''));
		var model = this.mediator.model;
		this.children = children;

		// find and replace child and binding comments
		
		function sweep(node:Node) {
			var childPattern:RegExp = /^\s*child#(\d+)\s*$/,
				bindingPattern:RegExp = /^\s*binding#(\d+)\s*$/,
				parent:Node = node.parentNode,
				next:Node,
				i:number,
				length:number,
				match:string[];
			// iterate all siblings
			while (node != null) {
				// capture next sibling before we manipulate dom
				next = node.nextSibling;
				// recursively sweep children
				for (i = 0, length = node.childNodes.length; i < length; ++i) {
					sweep(node.childNodes[i]);
				}
				// we only care about comment nodes
				if (node.nodeType == Node.COMMENT_NODE) {
					// test for child comment
					match = node.nodeValue.match(childPattern);
					if (match) {
						var widget = children[Number(match[1])];
						parent.replaceChild(widget.firstNode, node);
					}
					// test for binding comment
					match = node.nodeValue.match(bindingPattern);
					if (match) {
						var field:string = fragments[match[1]].binding;
						// TODO: can we use proper bindings here?
						var textNode = document.createTextNode(model.get(field));
						parent.replaceChild(textNode, node);
						// TODO: drip drip drip...
						var handle = model[field].observe(function(newValue:any) {
							textNode.nodeValue = newValue;
						});
					}
				}
				node = next;
			}
		}
		sweep(this.firstNode.nextSibling);
	}

	private _htmlSetter(html:string):void {
		this.html = html;
		// TODO: clean up children
		this.empty();
		this.lastNode.parentNode.insertBefore(domConstruct.toDom(html), this.lastNode);
	}

	destroy():void {
		array.forEach(this.children, function(child) {
			child.destroy();
		});
		this.children = null;
		super.destroy();
	}
}

export = Element;
