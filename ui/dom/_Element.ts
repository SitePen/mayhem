import dom = require('./interfaces');
import domUtil = require('./util');
import WidgetRenderer = require('./Widget');
import PlacePosition = require('../PlacePosition');
import style = require('../style/interfaces');
import ui = require('../interfaces');
import util = require('../../util');

class DomElementRenderer extends WidgetRenderer {
	elementType:string;

	add(widget:dom.IContainer, item:dom.IWidget, reference:any /* dom.IWidget | Node */):void {
		item._renderer.detach(item);
		if (reference && reference.nodeType) {
			// Replace provided reference node with item
			domUtil.place(item._outerFragment, reference, PlacePosition.REPLACE);
		}
		else {
			// must pass null instead of undefined for compatibility with insertBefore in old IE
			widget._outerFragment.insertBefore(item._outerFragment, reference ? reference._outerFragment : null);
		}
	}

	attachContent(widget:dom.IElementWidget):void {
		var content = widget._innerFragment;
		if (content && content.firstChild) {
			widget._outerFragment.appendChild(content);
		}
		widget._innerFragment = null;
	}

	attachStyles(widget:dom.IElementWidget):void {
		this.detachStyles(widget);

		widget._classListHandle = widget.get('classList').observe((value:string):void => {
			widget._outerFragment.className = value;
		});

		widget._styleHandle = widget.get('style').observe((value:any, previous:any, key:string):void => {
			domUtil.setStyle(widget._outerFragment, key, value);
		});
	}

	clear(widget:dom.IElementWidget):void {
		widget._outerFragment.innerHTML = '';
		widget._innerFragment = null;
	}

	detach(widget:dom.IElementWidget):void {
		var node = widget._outerFragment;
		node.parentNode && node.parentNode.removeChild(node);
	}

	detachContent(widget:dom.IElementWidget):void {
		var node = widget._outerFragment;
		widget._innerFragment = domUtil.extractRange(node.firstChild, node.lastChild);
	}

	render(widget:dom.IElementWidget):void {
		var node = document.createElement(this.elementType);
		// If widget is already attached to a parent swap out the new widget
		var previousNode = widget._outerFragment;
		if (previousNode && previousNode.parentNode) {
			previousNode.parentNode.replaceChild(node, previousNode);
		}
		widget._firstNode = widget._lastNode = widget._outerFragment = node;
	}

	setContent(widget:dom.IElementWidget, value?:any /* string | Node */):void {
		if (typeof value === 'string') {
			widget._outerFragment.innerHTML = value;
		}
		else {
			this.clear(widget);
			value && widget._outerFragment.appendChild(value);
		}
	}
}

DomElementRenderer.prototype.elementType = 'div';

export = DomElementRenderer;
