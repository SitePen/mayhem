import ClassList = require('../style/ClassList');
import dom = require('./interfaces');
import domUtil = require('./util');
import WidgetRenderer = require('./Widget');
import has = require('../../has');
import style = require('../style/interfaces');
import Style = require('../style/Style');
import ui = require('../interfaces');
import util = require('../../util');

class DomElementRenderer extends WidgetRenderer {
	elementType:string;

	add(widget:dom.IContainer, item:dom.IWidget, referenceItem:dom.IWidget):void {
		var referenceNode:Node = referenceItem && referenceItem._firstNode;

		widget._firstNode.insertBefore(item._fragment, referenceNode);
	}

	attachStyles(widget:dom.IElementWidget):void {
		this.detachStyles(widget);

		widget._classListHandle = widget.get('classList').observe((value:string):void => {
			widget._firstNode.className = value;
		});

		widget._styleHandle = widget.get('style').observe((value:style.IStyle, oldValue:style.IStyle, key:string):void => {
			if (has('debug') && key.indexOf('-') !== -1) {
				throw new Error('CSS properties in JavaScript are camelCase, not hyphenated');
			}

			domUtil.setStyle(widget._firstNode, key, value);
		});
	}

	clear(widget:dom.IElementWidget):void {
		widget._firstNode.innerHTML = '';
	}

	destroy(widget:dom.IElementWidget):void {
		this.detachStyles(widget);
		widget._classListHandle = widget._styleHandle = null;
		super.destroy(widget);
	}

	detach(widget:dom.IElementWidget):void {
		var firstNode = widget._firstNode;
		firstNode.parentNode && firstNode.parentNode.removeChild(firstNode);
	}

	detachStyles(widget:dom.IElementWidget):void {
		util.remove(widget._classListHandle);
		util.remove(widget._styleHandle);
	}

	remove(widget:dom.IContainer, item:dom.IWidget):void {
		var firstNode:Node = item._firstNode;
		firstNode.parentNode && firstNode.parentNode.removeChild(firstNode);
	}

	render(widget:dom.IElementWidget):void {
		widget.set({
			classList: new ClassList(),
			style: new Style()
		});
		var node = document.createElement(this.elementType);
		// If widget is already attached to a parent swap out the new widget
		var previousNode = widget._fragment;
		if (previousNode && previousNode.parentNode) {
			previousNode.parentNode.replaceChild(node, previousNode);
		}
		widget._firstNode = widget._lastNode = widget._fragment = node;
		this.attachStyles(widget);
	}

	setContent(widget:dom.IElementWidget, body?:any /* string | Node */):void {
		if (typeof body === 'string') {
			widget._firstNode.innerHTML = body;
		}
		else {
			this.clear(widget);
			body && widget._firstNode.appendChild(body);
		}
	}
}

DomElementRenderer.prototype.elementType = 'div';

export = DomElementRenderer;
