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

	// TODO: needs a better name
	setContents(html:any, children:widgets.IDomWidget[]) {
		// TODO: make text nodes for individual binding slots
		// TODO: but who should be responsible for doing the binding?
		this.set('html', html.join(''));
		this.children = children;
		for (var i = 0, length = children.length; i < length; ++i) {
			this._fillPlaceholder(i, children[i]);
		}
	}

	private _fillPlaceholder(i:number, widget:widgets.IDomWidget):void {
		var node:Node = this.firstNode.nextSibling,
			commentPattern:RegExp = /^\s*child#(\d+)\s*$/,
			match:string[];
		while (node != null) {
			if (node.nodeType == Node.COMMENT_NODE) {
				match = node.nodeValue.match(commentPattern);
				if (match && Number(match[1]) === i) {
					// TODO domUtil.getRange for MultiNodeWidgets?
					this.firstNode.parentNode.replaceChild(widget.firstNode, node);
					break;
				}
			}
			node = node.nextSibling;
		}
	}

	private _htmlSetter(html:string):void {
		this.html = html;
		this.children = [];
		// this._destroyChildren();

//		this.empty();
		domUtil.getRange(this.firstNode, this.lastNode, true).deleteContents();
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
