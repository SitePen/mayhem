import dom = require('./interfaces');
import domUtil = require('../../ui/dom/util');
import ui = require('../interfaces');

class DomRenderer implements ui.IRenderer {
	add(widget:dom.IContainer, item:dom.IWidget, referenceItem:dom.IWidget):void {
		var firstNode:Node = widget.get('firstNode'),
			lastNode:Node = widget.get('lastNode'),
			referenceNode:Node = referenceItem && referenceItem.get('firstNode'),
			itemNode:Node = item.get('fragment') || item.get('firstNode');

		if (firstNode === lastNode) {
			firstNode.insertBefore(itemNode, referenceNode);
		}
		else {
			firstNode.parentNode.insertBefore(itemNode, referenceNode || lastNode);
		}
	}

	destroy(widget:dom.IWidget):void {
		throw new Error('destroy not implemented');
	}

	remove(widget:dom.IContainer, item:dom.IWidget):void {
		var firstNode:Node = <any>item.get('firstNode'),
			lastNode:Node = <any>item.get('lastNode');

		if (firstNode !== lastNode) {
			// fragment widget
			item.set('fragment', domUtil.getRange(firstNode, lastNode).extractContents());
		}
		else {
			firstNode.parentNode && firstNode.parentNode.removeChild(firstNode);
		}
	}

	render(widget:dom.IWidget):void {
		throw new Error('render not implemented');
	}
}

export = DomRenderer;
