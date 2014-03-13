import dom = require('./interfaces');
import domUtil = require('./util');
import ui = require('../interfaces');
import util = require('../../util');

class BaseRenderer implements ui.IRenderer {
	add(widget:dom.IContainer, item:dom.IWidget, referenceItem:dom.IWidget, position:any):void {
		var firstNode:Node = widget.get('firstNode'),
			lastNode:Node = widget.get('lastNode'),
			referenceNode:Node = referenceItem && referenceItem.get('firstNode'),
			itemNode:Node = item.get('fragment');

		firstNode.parentNode.insertBefore(itemNode, referenceNode || lastNode);
	}

	attachToWindow(widget:dom.IContainer, node:Node):void {
		node.appendChild(widget.get('fragment'));
	}

	clear(widget:dom.IWidget):void {
		domUtil.getRange(widget.get('firstNode'), widget.get('lastNode'), true).deleteContents();
	}

	destroy(widget:dom.IWidget):void {
		widget.set({
			firstNode: null,
			fragment: null,
			lastNode: null
		});
	}

	detach(widget:dom.IWidget):void {
		var fragment = widget.get('fragment');
		if (!fragment || !fragment.firstChild) {
			widget.set('fragment', domUtil.getRange(widget.get('firstNode'), widget.get('lastNode')).extractContents());
		}
	}

	getContent(widget:dom.IComposite):Node {
		return // TODO
	}

	getTextContent(widget:dom.IComposite):string {
		return // TODO
	}

	remove(widget:dom.IContainer, item:dom.IWidget):void {
		var firstNode:Node = <any>item.get('firstNode'),
			lastNode:Node = <any>item.get('lastNode');

		item.set('fragment', domUtil.getRange(firstNode, lastNode).extractContents());
	}

	render(widget:dom.IWidget, options:dom.IRenderOptions = {}):void {
		// TODO: respect options.fragment, etc.

		var commentId:string = ((<any> widget.constructor).name || '') + '#' + widget.get('id').replace(/--/g, '\u2010\u2010');

		var firstNode = document.createComment(commentId),
			lastNode = document.createComment('/' + commentId),
			fragment = document.createDocumentFragment();

		fragment.appendChild(firstNode);
		fragment.appendChild(lastNode);

		widget.set({
			firstNode: firstNode,
			fragment: fragment,
			lastNode: lastNode
		});
	}

	setAttribute(widget:dom.IComponent, name:string, value:string):void {
		// TODO: encode in comment, perhaps?
	}

	setBody(widget:dom.IWidget, body?:any /* string | Node */):void {
		if (typeof body === 'string') {
			body = domUtil.toDom(body);
		}
		this.clear(widget);
		body && widget.get('firstNode').parentNode.insertBefore(body, widget.get('lastNode'));
	}

	setBodyText(widget:dom.IComposite, text:string):string {
		var body:string = util.escapeXml(text);
		this.setBody(widget, body);
		return body;
	}
}

export = BaseRenderer;
