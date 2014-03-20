import ClassList = require('../style/ClassList');
import dom = require('./interfaces');
import domUtil = require('./util');
import WidgetRenderer = require('./Widget');
import has = require('../../has');
import style = require('../style/interfaces');
import Style = require('../style/Style');
import ui = require('../interfaces');

class _Element extends WidgetRenderer {
	elementType:string;

	add(widget:dom.IContainer, item:dom.IElementWidget, referenceItem:dom.IElementWidget, position:any):void {
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
		widget._classListHandle && widget._classListHandle.remove();
		widget._styleHandle && widget._styleHandle.remove();
	}

	remove(widget:dom.IContainer, item:dom.IElementWidget):void {
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

	// /* protected */ _replace(widget:dom.IElementWidget, newRoot:HTMLElement):void {
	// 	var newRoot = document.createElement(this.get('elementType'));
	// 	// If widget is already attached to a parent swap out the new widget
	// 	this.detach(widget);
	// 	var oldRoot = widget._fragment;
	// 	if (oldRoot && oldRoot.parentNode) {
	// 		oldRoot.parentNode.replaceChild(newRoot, oldRoot);
	// 	}
	// 	widget._firstNode = widget._lastNode = widget._fragment = newRoot;
	// }

	setBody(widget:dom.IElementWidget, body?:any /* string | Node */):void {
		if (typeof body === 'string') {
			widget._firstNode.innerHTML = body;
		}
		else {
			this.clear(widget);
			body && widget._firstNode.appendChild(body);
		}
	}
}

_Element.prototype.elementType = 'div';

export = _Element;
