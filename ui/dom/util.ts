/// <reference path="../../dojo" />

import AdapterRegistry = require('dojo/AdapterRegistry');
import has = require('../../has');
import lang = require('dojo/_base/lang');
import Widget = require('./Widget');

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
		var findPos = function (findNode:Node, returnEndPosition:boolean = false):number {
			var textPosition:number = 0;

			function add(node:Node):void {
				if (node.nodeType === Node.TEXT_NODE) {
					textPosition += node.nodeValue.length;
				}
				else if (node.nodeType === Node.ELEMENT_NODE) {
					walk(node);
				}
			}

			function walk(parentNode:Node):void {
				var node:Node = parentNode.firstChild;
				do {
					if (node !== findNode || returnEndPosition) {
						add(node);
					}
				} while (node !== findNode && (node = node.nextSibling));
			}

			walk(findNode.parentNode);

			return textPosition;
		};

		var textRange:TextRange = (<HTMLBodyElement> document.body).createTextRange();
		textRange.moveToElementText(<Element> widget.get('firstNode').parentNode);

		do {
			firstNode = firstNode.nextSibling;
		} while (firstNode.nodeType !== Node.ELEMENT_NODE && firstNode.nodeType !== Node.TEXT_NODE);

		do {
			lastNode = lastNode.previousSibling;
		} while (lastNode.nodeType !== Node.ELEMENT_NODE && lastNode.nodeType !== Node.TEXT_NODE);

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

var extendEvent:(event:Event, newProperties:HashMap<any>) => Event;
export var setEventProperty:(event:/* mayhem event or native event */ any, key:string, value:any) => void;
// There is no supported environment with ES5 and not DOM events, so assume a mapping between the two features for
// the sake of implementation simplicity
if (has('dom-addeventlistener')) {
	extendEvent = function (event:Event, newProperties:HashMap<any>):Event {
		var newEvent:Event = Object.create(event);
		var key:string;
		for (key in newProperties) {
			setEventProperty(newEvent, key, newProperties[key]);
		}

		for (key in { preventDefault: 1, stopPropagation: 1, stopImmediatePropagation: 1 }) {
			setEventProperty(newEvent, key, (function (key:string):() => void {
				return function ():void {
					event[key]();
				};
			})(key));
		}

		return newEvent;
	};
	setEventProperty = function (event:Event, key:string, value:any):void {
		Object.defineProperty(event, key, {
			value: value,
			configurable: true,
			enumerable: true
		});
	};
}
else {
	extendEvent = function (event:Event, newProperties:HashMap<any>):Event {
		var newEvent:Event = <any> lang.delegate(event);
		var key:string;
		for (key in newProperties) {
			newEvent[key] = newProperties[key];
		}

		newEvent.target = event.srcElement;
		if ((<MSEventObj> event).fromElement) {
			(<MouseEvent> newEvent).relatedTarget = (<MSEventObj> event).fromElement;
		}

		newEvent.preventDefault = function ():void {
			(<MSEventObj> event).returnValue = false;
		};

		newEvent.stopPropagation = function ():void {
			event.cancelBubble = true;
		};

		newEvent.stopImmediatePropagation = function ():void {
			event.cancelBubble = true;
		};

		return newEvent;
	};
	setEventProperty = function (event:Event, key:string, value:any):void {
		event[key] = value;
	};
}

export var eventNormalizers = new AdapterRegistry<PointerEvent[]>();
eventNormalizers.register('touch', function (event:TouchEvent):boolean {
	return event.type.indexOf('touch') === 0;
}, function (event:TouchEvent):PointerEvent[] {
	var events:PointerEvent[] = [];

	for (var i:number = 0, touch:TouchEvent.Touch; (touch = event.changedTouches[i]); ++i) {
		events.push(<PointerEvent> extendEvent(event, {
			height: 0,
			isPrimary: touch.identifier === event.touches[0].identifier,
			pointerId: touch.identifier,
			pointerType: 'touch',
			pressure: 0.5,
			target: <EventTarget> document.elementFromPoint(touch.clientX, touch.clientY),
			tiltX: 0,
			tiltY: 0,
			type: nativeEventMap[event.type],
			width: 0
		}));
	}

	return events;
});
eventNormalizers.register('mouse', function (event:MouseEvent):boolean {
	return event.type.indexOf('mouse') === 0 || event.type === 'click' || event.type === 'dblclick';
}, function (event:MouseEvent):PointerEvent[] {
	return [ <PointerEvent> extendEvent(event, {
		height: 0,
		isPrimary: true,
		pointerId: 0,
		pointerType: 'mouse',
		pressure: event.button > 0 ? 0.5 : 0,
		tiltX: 0,
		tiltY: 0,
		type: nativeEventMap[event.type],
		width: 0
	}) ];
});
eventNormalizers.register('pointer', function (event:PointerEvent):boolean {
	return event.type.indexOf('pointer') > -1;
}, function (event:PointerEvent):PointerEvent[] {
	return [ event ];
});

var nativeEventMap = {
	click: 'click',
	dblclick: 'doubleclick',
	focusin: 'focus',
	focusout: 'blur',
	input: 'input',
	keydown: 'keydown',
	keypress: 'keypress',
	keyup: 'keyup',
	mousedown: 'pointerdown',
	mouseenter: 'pointerenter',
	mouseleave: 'pointerleave',
	mousemove: 'pointermove',
	mouseout: 'pointerout',
	mouseover: 'pointerover',
	mouseup: 'pointerup',
	MSGotPointerCapture: 'gotpointercapture',
	MSLostPointerCapture: 'lostpointercapture',
	MSPointerCancel: 'pointercancel',
	MSPointerDown: 'pointerdown',
	MSPointerEnter: 'pointerenter',
	MSPointerLeave: 'pointerleave',
	MSPointerMove: 'pointermove',
	MSPointerOut: 'pointerout',
	MSPointerOver: 'pointerover',
	MSPointerUp: 'pointerup',
	touchcancel: 'pointercancel',
	touchend: 'pointerup',
	touchmove: 'pointermove',
	touchstart: 'pointerdown'
};

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
 * @param root The root element that should be searched.
 * @returns The nearest widget.
 */
function findNearestParent(node:Node, root:Element):Widget {
	checkNode:
	do {
		// found a SingleNodeWidget parent
		if (node['widget']) {
			break checkNode;
		}

		// nearest element was not a widget; search sibling comment nodes for MultiNodeWidgets first
		checkSibling:
		while ((node = node.previousSibling)) {
			// found a MultiNodeWidget parent
			if (node.nodeType === Node.COMMENT_NODE && node['widget'] && node.nodeValue.charAt(0) !== '/') {
				break checkNode;
			}
		}

	// continue to search through parentNodes until we find a widget parent
	} while (node !== root && (node = node.parentNode));

	// if a widget is not discovered at this point then there is a bug and we will crash
	if (!node || !node['widget']) {
		throw new Error('Could not find any parent widget for event target');
	}

	return node['widget'];
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

	// none of the children were responsible for the event, so it is us
	return widget;
}

/**
 * Given a DOM pointer, touch, or mouse event, find the nearest parent widget to the point on the page that emitted the
 * event.
 *
 * @param event The event.
 * @param root The root element for the application. Searches shall never go above this element.
 * @returns The widget at the given point.
 */
export function findWidgetFromEvent(event:{ target:Element; explicitOriginalTarget?:Node; clientX:number; clientY:number; }, root:Element):Widget {
	// Firefox has a non-standard `explicitOriginalTarget` property that we can use to more efficiently discover
	// the target widget, since it allows us to know exactly which node (including text nodes) was hit
	if (event.explicitOriginalTarget) {
		return findNearestParent(event.explicitOriginalTarget, root);
	}

	// Otherwise, we can only get the nearest parent of the nearest Element to the event, and then have to search
	// its children based on the event coordinates to find the true parent widget
	var parent:Widget = findNearestParent(<Node> event.target, root);
	return findWidgetAtPoint(parent, event.clientX, event.clientY);
}
