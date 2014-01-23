import domConstruct = require('dojo/dom-construct');
import DomContainer = require('./Container');
import domUtil = require('./util');
import MultiNodeWidget = require('./MultiNodeWidget');
import PlacePosition = require('../PlacePosition');
import core = require('../../interfaces');
import widgets = require('../interfaces');

/**
 * The Element class provides a DOM-specific widget that encapsulates one or more DOM nodes.
 */
class Element extends MultiNodeWidget {

	html:string;

	/*private*/ _fillPlaceholder(i:number, widget:widgets.IDomWidget):void {
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

	/*private*/ _htmlSetter(html:string):void {
		this.html = html;

//		this.empty();
		domUtil.getRange(this.firstNode, this.lastNode, true).deleteContents();
		this.lastNode.parentNode.insertBefore(domConstruct.toDom(html), this.lastNode);
	}
}

export = Element;
