import ClassList = require('../style/ClassList');
import domUtil = require('./util');
import DomWidgetRenderer = require('./Widget');
import has = require('../../has');
import style = require('../style/interfaces');
import Style = require('../style/Style');
import ui = require('../interfaces');

class DomElementRenderer extends DomWidgetRenderer {
	elementType:string;

	add(widget:ui.IContainerImpl, item:ui.IWidgetImpl, referenceItem:ui.IWidgetImpl, position:any):void {
		var referenceNode:Node = referenceItem && referenceItem._impl.firstNode;

		widget._impl.firstNode.insertBefore(item._impl.fragment, referenceNode);
	}

	attachStyles(widget:ui.IWidgetImpl):void {
		this.detachStyles(widget);

		widget._impl.classListHandle = widget.get('classList').observe((value:string):void => {
			widget._impl.firstNode.className = value;
		});

		widget._impl.styleHandle = widget.get('style').observe((value:style.IStyle, oldValue:style.IStyle, key:string):void => {
			if (has('debug') && key.indexOf('-') !== -1) {
				throw new Error('CSS properties in JavaScript are camelCase, not hyphenated');
			}

			domUtil.setStyle(widget._impl.firstNode, key, value);
		});
	}

	clear(widget:ui.IWidgetImpl):void {
		widget._impl.firstNode.innerHTML = '';
	}

	destroy(widget:ui.IWidgetImpl):void {
		this.detachStyles(widget);
		widget._impl.classListHandle = widget._impl.styleHandle = null;
		super.destroy(widget);
	}

	detach(widget:ui.IWidgetImpl):void {
		var firstNode = widget._impl.firstNode;
		firstNode.parentNode && firstNode.parentNode.removeChild(firstNode);
	}

	detachStyles(widget:ui.IWidgetImpl):void {
		widget._impl.classListHandle && widget._impl.classListHandle.remove();
		widget._impl.styleHandle && widget._impl.styleHandle.remove();
	}

	remove(widget:ui.IWidgetImpl, item:ui.IWidgetImpl):void {
		var firstNode:Node = item._impl.firstNode;
		firstNode.parentNode && firstNode.parentNode.removeChild(firstNode);
	}

	render(widget:ui.IWidgetImpl):void {
		widget.set({
			classList: new ClassList(),
			style: new Style()
		});
		var node = document.createElement(this.elementType);
		// If widget is already attached to a parent swap out the new widget
		var previousNode = widget._impl.fragment;
		if (previousNode && previousNode.parentNode) {
			previousNode.parentNode.replaceChild(node, previousNode);
		}
		widget._impl.firstNode = widget._impl.lastNode = widget._impl.fragment = node;
		this.attachStyles(widget);
	}

	// /* protected */ _replace(widget:ui.IWidget, newRoot:HTMLElement):void {
	// 	var newRoot = document.createElement(this.get('elementType'));
	// 	// If widget is already attached to a parent swap out the new widget
	// 	this.detach(widget);
	// 	var oldRoot = widget._impl.fragment;
	// 	if (oldRoot && oldRoot.parentNode) {
	// 		oldRoot.parentNode.replaceChild(newRoot, oldRoot);
	// 	}
	// 	widget._impl.firstNode = widget._impl.lastNode = widget._impl.fragment = newRoot;
	// }

	setBody(widget:ui.IWidgetImpl, body?:any /* string | Node */):void {
		if (typeof body === 'string') {
			widget._impl.firstNode.innerHTML = body;
		}
		else {
			this.clear(widget);
			body && widget._impl.firstNode.appendChild(body);
		}
	}
}

DomElementRenderer.prototype.elementType = 'div';

export = DomElementRenderer;
