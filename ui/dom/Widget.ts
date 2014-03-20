import dom = require('./interfaces');
import domUtil = require('./util');
import domConstruct = require('dojo/dom-construct');
import Observable = require('../../Observable');
import ui = require('../interfaces');
import util = require('../../util');

class DomWidgetRenderer implements ui.IRenderer {
	add(widget:dom.IContainer, item:dom.IWidget, referenceItem:dom.IWidget, position:any):void {
		var referenceNode:Node = referenceItem && referenceItem._firstNode;
		widget._firstNode.parentNode.insertBefore(item._fragment, referenceNode || widget._lastNode);
	}

	attachToWindow(widget:dom.IWidget, node:Node):void {
		node.appendChild(widget._fragment);
	}

	clear(widget:dom.IWidget):void {
		domUtil.getRange(widget._firstNode, widget._lastNode, true).deleteContents();
	}

	destroy(widget:dom.IWidget):void {
		widget._firstNode = widget._lastNode = widget._fragment = null;
	}

	detach(widget:dom.IWidget):void {
		var fragment = widget._fragment;
		if (!fragment || !fragment.firstChild) {
			widget._fragment = domUtil.getRange(widget._firstNode, widget._lastNode).extractContents();
		}
	}

	remove(widget:dom.IContainer, item:dom.IWidget):void {
		item._fragment = domUtil.getRange(item._firstNode, item._lastNode).extractContents();
	}

	render(widget:dom.IWidget):void {
		var commentId:string = ((<any> widget.constructor).name || '') + '#' + widget.get('id').replace(/--/g, '\u2010\u2010');

		var firstNode = widget._firstNode = document.createComment(commentId),
			lastNode = widget._lastNode = document.createComment('/' + commentId),
			fragment = widget._fragment = document.createDocumentFragment();

		fragment.appendChild(firstNode);
		fragment.appendChild(lastNode);
	}

	setBody(widget:dom.IWidget, body?:any /* string | Node */):void {
		if (typeof body === 'string') {
			body = domUtil.toDom(body);
		}
		this.clear(widget);
		body && widget._firstNode.parentNode.insertBefore(body, widget._lastNode);
	}
}

export = DomWidgetRenderer;
