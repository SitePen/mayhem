import has = require('../../has');
import Master = require('./Master');
import util = require('../../util');
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

	// if the widget is a SingleNodeWidget (both nodes are the same) then we know it did not raise the event since the
	// event would have had the widget’s Element as the target node. otherwise if there is no content between the first
	// and last nodes, we know it did not raise the event since the event could not have been created from a widget
	// with no content (and thus no dimension)
	if (firstNode === lastNode || firstNode.nextSibling === lastNode) {
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
		// given:
		//
		// <parent><element> text <!--firstNode--> ...</parent>
		// we start at `firstNode`, walk backwards until we get to `element`, set the range to the content of `element`,
		// move the end position of the range forward the number of characters in `text`, then set the start position
		// of the final range to this range’s end position.
		//
		// <parent>... <!--lastNode--> text <element></parent>
		// we start at `lastNode`, walk forwards until we get to `element`, set the range to the content of `element`,
		// move the start position of the range backward the number of characters in `text`, then set the end position
		// of the final range to this range’s start position.
		//
		// <parent><!--firstNode--> ...</parent>
		// the start position of the range is the start position of a range selecting the parent
		//
		// <parent>... <!--lastNode--></parent>
		// the end position of the range is the end position of a range selecting the parent
		var findPosition = function (targetRange:TextRange, findNode:Node, nodeType:string):void {
			var range:TextRange = (<HTMLBodyElement> document.body).createTextRange();
			var numCharacters:number = 0;
			var node:Node = findNode;

			while (node && node.nodeType !== 1) {
				if (node.nodeType === 3) {
					numCharacters += (<Text> node).length;
				}

				node = nodeType === 'firstNode' ? node.previousSibling : node.nextSibling;
			}

			range.moveToElementText(<Element> (node || findNode.parentNode));

			if (nodeType === 'firstNode') {
				numCharacters && range.moveEnd('character', numCharacters);
				targetRange.setEndPoint('EndToStart', range);
			}
			else {
				numCharacters && range.moveStart('character', -numCharacters);
				targetRange.setEndPoint('StartToEnd', range);
			}
		};

		var expandRect = function (rect:ClientRect):ClientRect {
			var finalRect:ClientRect = <any> {
				left: rect.left,
				right: rect.right,
				top: rect.top,
				bottom: rect.bottom
			};
			var elementRect:ClientRect;
			var node:Node = firstNode;
			while (node !== lastNode) {
				if (node.nodeType === 1) {
					elementRect = (<HTMLElement> node).getBoundingClientRect();
					finalRect.top = Math.min(finalRect.top, elementRect.top);
					finalRect.left = Math.min(finalRect.left, elementRect.left);
					finalRect.right = Math.max(finalRect.right, elementRect.right);
					finalRect.bottom = Math.max(finalRect.bottom, elementRect.bottom);
				}

				node = node.nextSibling;
			}

			return finalRect;
		};

		var textRange:TextRange = (<HTMLBodyElement> document.body).createTextRange();
		textRange.moveToElementText(<Element> firstNode.parentNode);
		findPosition(textRange, firstNode, 'firstNode');
		findPosition(textRange, lastNode, 'lastNode');

		// The text bounding box in IE8 excludes the size of selected elements (and part of the selected text as well),
		// so we have to manually expand the box size by also looking at all the elements
		rect = expandRect(textRange.getBoundingClientRect());
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
		return util.createHandle(function () {
			target.removeEventListener(type, listener, true);
			target = type = listener = null;
		});
	};
}
else {
	on = <any> function (target:MSEventAttachmentTarget, type:string, listener:EventListener):IHandle {
		target.attachEvent('on' + type, function ():void {
			var event:any = window.event;
			event.target = event.srcElement;
			event.currentTarget = target;

			if (event.type === 'mouseover') {
				event.relatedTarget = event.fromElement;
			}
			else if (event.type === 'mouseout') {
				event.relatedTarget = event.toElement;
			}

			event.stopPropagation = function ():void {
				event.cancelBubble = true;
			};
			event.preventDefault = function ():void {
				event.returnValue = false;
			};

			listener.call(this, event);
		});

		return util.createHandle(function () {
			target.detachEvent('on' + type, listener);
			target = type = listener = null;
		});
	};
}

/**
 * Finds the nearest widget parent to the given node.
 *
 * @param node The node to find ownership over.
 * @param master The master UI that the discovered widget should belong to.
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
		var masterView = <Widget> master.get('view');
		if (masterView.get('firstNode').nodeType === Node.COMMENT_NODE) {
			return masterView;
		}
		else {
			return null;
		}
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
function findWidgetAtPoint(widget:Widget, x:number, y:number, domTarget:Element):Widget {
	var widgetNode:Node = widget.get('firstNode');
	var node:Node;

	// If the initial DOM target element does not contain our parent widget’s node, this means that the target DOM
	// element is somewhere inside of our parent widget and we can avoid all descending node traversal by starting
	// there instead
	if (!(<HTMLElement> domTarget).contains(<HTMLElement> widgetNode)) {
		node = <Node> domTarget.firstChild;
	}
	else if (widgetNode.nodeType === Node.COMMENT_NODE) {
		node = widgetNode.nextSibling;
	}
	else {
		node = widgetNode.firstChild;
	}

	// if this widget has no children then we know we hit the right one
	if (!node) {
		return widget;
	}

	// otherwise we need to find out which child is responsible for the event
	var lastCandidate:Widget;

	do {
		// Found a child that is a MultiNodeWidget; it might be the innermost widget
		if (node.nodeType === Node.COMMENT_NODE && (<any> node)['widget']) {
			var candidateWidget:Widget = (<any> node)['widget'];

			if (node.nodeValue.charAt(0) !== '/') {
				if (checkPointInWidget(candidateWidget, x, y)) {
					lastCandidate = candidateWidget;
				}
			}
			else if (candidateWidget === lastCandidate) {
				// This is the end node of the innermost nested candidate, which means it is the innermost widget
				// and we can stop looking
				return lastCandidate;
			}
		}
	} while ((node = node.nextSibling));

	// at this point, none of the children were responsible for the event, so it must be us
	return widget;
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
	var domTarget:Element = document.elementFromPoint(x, y);
	var parent:Widget = findNearestParent(master, domTarget);

	// If no parent is found from the element, then there is no widget at all at the given point
	if (!parent) {
		return null;
	}

	return findWidgetAtPoint(parent, x, y, domTarget);
}
