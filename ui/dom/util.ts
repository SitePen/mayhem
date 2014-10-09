/// <reference path="../../dojo" />

import has = require('../../has');
import Master = require('./Master');
import Widget = require('./Widget');

var Node:Node;
if (has('dom-addeventlistener')) {
	Node = (<any> window).Node;
}
else {
	Node = <any> {
		ELEMENT_NODE: 1,
		ATTRIBUTE_NODE: 2,
		TEXT_NODE: 3,
		COMMENT_NODE: 8,
		DOCUMENT_NODE: 9,
		DOCUMENT_FRAGMENT_NODE: 11
	};
}

has.add('dom-range', Boolean(typeof document !== 'undefined' && document.createRange));

interface TouchEvent extends UIEvent {
	changedTouches:TouchEvent.TouchList;
	altKey:boolean;
	ctrlKey:boolean;
	metaKey:boolean;
	shiftKey:boolean;
	targetTouches:TouchEvent.TouchList;
	touches:TouchEvent.TouchList;
}

module TouchEvent {
	export interface Touch {
		clientX:number;
		clientY:number;
		identifier:number;
		pageX:number;
		pageY:number;

		screenX:number;
		screenY:number;
		target:EventTarget;
	}

	export interface TouchList {
		[index:number]:TouchEvent.Touch;
		item(index:number):TouchEvent.Touch;
		length:number;
	}
}

/**
 * Determines whether the coordinate `x, y` is within the bounding box of the given widget.
 *
 * @param widget The widget to test.
 * @param x The x-coordinate, relative to the viewport.
 * @param y The y-coordinate, relative to the viewport.
 * @returns `true` if the coordinates are within the bounding box of the widget.
 */
function checkPointInWidget(widget:Widget, x:number, y:number):boolean {
	var firstNode:Node = widget.get('firstNode');
	var lastNode:Node = widget.get('lastNode');

	// if the widget is a SingleNodeWidget then we know it did not raise the event since the event would have had the
	// widget’s Element as the target node
	if (firstNode === lastNode) {
		return false;
	}

	var rect:ClientRect;

	if (has('dom-range')) {
		var range:Range = document.createRange();
		range.setStartAfter(widget.get('firstNode'));
		range.setEndBefore(widget.get('lastNode'));
		rect = range.getBoundingClientRect();
	}
	else {
		/**
		 * Finds the text position of `findNode` inside its parent so that an IE range can be generated around it.
		 *
		 * @param findNode The node whose character position should be found.
		 * @param returnEndPosition If true, returns the position at the end of `findNode`.
		 * @returns The character position of the node.
		 */
		var findPos = function (findNode:Node, returnEndPosition:boolean = false):number {
			var textPosition:number = 0;

			function add(node:Node):void {
				if (node.nodeType === Node.TEXT_NODE) {
					textPosition += node.nodeValue.length;
				}
				else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length) {
					walk(node);
				}
			}

			function walk(node:Node):void {
				node = node.firstChild;

				do {
					if (node !== findNode || returnEndPosition) {
						add(node);
					}
				}
				while (node !== findNode && (node = node.nextSibling));
			}

			walk(findNode.parentNode);

			return textPosition;
		};

		var textRange:TextRange = (<HTMLBodyElement> document.body).createTextRange();
		textRange.moveToElementText(<Element> firstNode.parentNode);

		textRange.moveStart('character', findPos(firstNode));
		textRange.moveEnd('character', findPos(lastNode, true));
		rect = textRange.getBoundingClientRect();
	}

	return (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom);
}

export function extractContents(start:Node, end:Node, exclusive:boolean = false):DocumentFragment {
	if (has('dom-range')) {
		var range:Range = document.createRange();

		if (start.parentNode && end.parentNode) {
			if (exclusive) {
				range.setStartAfter(start);
				range.setEndBefore(end);
			}
			else {
				range.setStartBefore(start);
				range.setEndAfter(end);
			}
		}
		else {
			// TODO: what does this mean?
			// point range at the end of the document (it has to point within the document nodes can be inserted)
			range.setStartAfter(document.body.lastChild);
			range.setEndAfter(document.body.lastChild);
			range.insertNode(end);
			range.insertNode(start);
		}

		return range.extractContents();
	}
	else {
		var fragment = document.createDocumentFragment();
		var next:Node;

		if (start.parentNode && start.parentNode === end.parentNode) {
			if (exclusive) {
				start = start.nextSibling;
			}

			while (start !== end) {
				next = start.nextSibling;
				fragment.appendChild(start);
				start = next;
			}

			if (!exclusive) {
				fragment.appendChild(start);
			}
		}
		else {
			fragment.appendChild(start);
			fragment.appendChild(end);
		}

		return fragment;
	}
}

export var on:(target:EventTarget, type:string, listener:EventListener) => IHandle;
if (has('dom-addeventlistener')) {
	on = function (target:EventTarget, type:string, listener:EventListener):IHandle {
		target.addEventListener(type, listener, true);
		return {
			remove: function ():void {
				this.remove = function ():void {};
				target.removeEventListener(type, listener, true);
				target = type = listener = null;
			}
		};
	};
}
else {
	on = <any> function (target:MSEventAttachmentTarget, type:string, listener:EventListener):IHandle {
		target.attachEvent('on' + type, function ():void {
			listener.call(this, window.event);
		});

		return {
			remove: function ():void {
				this.remove = function ():void {};
				target.detachEvent('on' + type, listener);
				target = type = listener = null;
			}
		};
	};
}

/**
 * Finds the nearest widget parent to the given node.
 *
 * @param node The node to find ownership over.
 * @param master The master UI should be searched.
 * @returns The nearest widget.
 */
export function findNearestParent(master:Master, searchNode:Node):Widget {
	var root:Element = master.get('root');

	// The search node is not inside the root, so is definitely not from this application
	if (!(<HTMLElement> root).contains(<HTMLElement> searchNode)) {
		return null;
	}

	var node:Node = searchNode;
	var inSiblingWidget:string;

	checkNode:
	while (node !== root) {
		// TODO: Use the right property name
		// found a SingleNodeWidget parent
		// TS7017
		if ((<any> node)['widget']) {
			break checkNode;
		}

		// nearest element was not a widget; search sibling comment nodes for MultiNodeWidgets first
		checkSibling:
		while (node.previousSibling) {
			// we still need to end up with a node at `node` by the end of this search, so the assignment cannot
			// be done in the loop condition
			node = node.previousSibling;

			// found a MultiNodeWidget
			// TODO: Use the right property name
			// TS7017
			if (node.nodeType === Node.COMMENT_NODE && (<any> node)['widget']) {
				// The discovered widget is a sibling, not a parent
				if (node.nodeValue.charAt(0) === '/') {
					inSiblingWidget = node.nodeValue.slice(1);
				}
				// The discovered widget is the end of the previous found sibling
				else if (inSiblingWidget === node.nodeValue) {
					inSiblingWidget = null;
				}
				// The discovered widget is a parent MultiNodeWidget
				else if (!inSiblingWidget) {
					break checkNode;
				}
			}
		}

		// continue to search through parentNodes until we find a widget parent
		node = node.parentNode;
	}

	// got up to the root without finding a widget. this means that either the given node is in the same root element
	// as the master view but is outside the view, or the master view is a MultiNodeWidget and the nearest widget to the
	// node *is* the master view. without checking the coordinates, it is impossible to know, so return the root view
	// and let the next step decide
	if (node === root) {
		return <any> master.get('view');
	}

	// TS7017
	return (<any> node)['widget'];
}

/**
 * Finds the nearest parent widget to the viewport coordinate `x, y`.
 *
 * @param widget The nearest widget that was discovered by element traversal.
 * @param x The x-coordinate of the pointer, relative to the viewport.
 * @param y The y-coordinate of the pointer, relative to the viewport.
 * @returns The widget at the given point.
 */
function findWidgetAtPoint(widget:Widget, x:number, y:number):Widget {
	var children:Widget[] = <any> widget.get('children');
	// if this widget has no children then we know we hit the right one
	if (!children || !children.length) {
		return widget;
	}

	// otherwise we need to find out which child is responsible for the event
	for (var i = 0, child:Widget; (child = children[i]); ++i) {
		if (checkPointInWidget(child, x, y)) {
			return child;
		}
	}

	// none of the children were responsible for the event, so it is either us, or the node did not belong to our app
	return checkPointInWidget(widget, x, y) ? widget : null;
}

/**
 * Given a DOM pointer, touch, or mouse event, find the nearest parent widget to the point on the page that emitted the
 * event.
 *
 * @param x
 * @param y
 * @param master The master UI for the application. Searches shall never go above here.
 * @returns The widget at the given point, or `null` if there is no widget belonging to the given master UI at the
 * given point.
 */
export function findWidgetAt(master:Master, x:number, y:number):Widget {
	var parent:Widget = findNearestParent(master, document.elementFromPoint(x, y));

	// If no parent is found from the element, then there is no widget at all at the given point
	if (!parent) {
		return null;
	}

	return findWidgetAtPoint(parent, x, y);
}
