import domUtil = require('./util');
import domConstruct = require('dojo/dom-construct');
import Observable = require('../../Observable');
import ui = require('../interfaces');
import util = require('../../util');

class DomWidgetRenderer implements ui.IRenderer {
	add(widget:ui.IContainerImpl, item:ui.IWidgetImpl, referenceItem:ui.IWidgetImpl, position:any):void {
		var referenceNode:Node = referenceItem && referenceItem._impl.firstNode;
		widget._impl.firstNode.parentNode.insertBefore(item._impl.fragment, referenceNode || widget._impl.lastNode);
	}

	attachToWindow(widget:ui.IWidgetImpl, node:Node):void {
		node.appendChild(widget._impl.fragment);
	}

	clear(widget:ui.IWidgetImpl):void {
		domUtil.getRange(widget._impl.firstNode, widget._impl.lastNode, true).deleteContents();
	}

	destroy(widget:ui.IWidgetImpl):void {
		widget._impl.firstNode = widget._impl.lastNode = widget._impl.fragment = null;
	}

	detach(widget:ui.IWidgetImpl):void {
		var fragment = widget._impl.fragment;
		if (!fragment || !fragment.firstChild) {
			widget._impl.fragment = domUtil.getRange(widget._impl.firstNode, widget._impl.lastNode).extractContents();
		}
	}

	remove(widget:ui.IContainerImpl, item:ui.IWidgetImpl):void {
		item._impl.fragment = domUtil.getRange(item._impl.firstNode, item._impl.lastNode).extractContents();
	}

	render(widget:ui.IWidgetImpl):void {
		var commentId:string = ((<any> widget.constructor).name || '') + '#' + widget.get('id').replace(/--/g, '\u2010\u2010');

		var firstNode = widget._impl.firstNode = document.createComment(commentId),
			lastNode = widget._impl.lastNode = document.createComment('/' + commentId),
			fragment = widget._impl.fragment = document.createDocumentFragment();

		fragment.appendChild(firstNode);
		fragment.appendChild(lastNode);
	}

	setBody(widget:ui.IWidgetImpl, body?:any /* string | Node */):void {
		if (typeof body === 'string') {
			body = domUtil.toDom(body);
		}
		this.clear(widget);
		body && widget._impl.firstNode.parentNode.insertBefore(body, widget._impl.lastNode);
	}
}

export = DomWidgetRenderer;
