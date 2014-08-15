/// <reference path="../../dojo" />
import AdapterRegistry = require('dojo/AdapterRegistry');
import core = require('../../interfaces');
import domUtil = require('./util');
import has = require('../../has');
import lang = require('dojo/_base/lang');
import IMaster = require('../Master');
import MultiNodeWidget = require('./MultiNodeWidget');
import Promise = require('../../Promise');
import util = require('../../util');
import View = require('./View');
import Widget = require('./Widget');

interface IListener {
	callback:core.IEventListener<core.IEvent>;
	widget:Widget;
}

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

var extendEvent:(event:Event, newProperties:HashMap<any>) => Event;
var setEventProperty:(event:Event, key:string, value:any) => void;
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
		var newEvent:UIEvent = <any> lang.delegate(event);
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

var normalizers = new AdapterRegistry();
normalizers.register('touch', function (event:TouchEvent):boolean {
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
normalizers.register('mouse', function (event:MouseEvent):boolean {
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
normalizers.register('pointer', function (event:PointerEvent):boolean {
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
	touchcancel: 'pointercancel',
	touchend: 'pointerup',
	touchmove: 'pointermove',
	touchstart: 'pointerdown',
	MSGotPointerCapture: 'gotpointercapture',
	MSLostPointerCapture: 'lostpointercapture',
	MSPointerCancel: 'pointercancel',
	MSPointerDown: 'pointerdown',
	MSPointerEnter: 'pointerenter',
	MSPointerLeave: 'pointerleave',
	MSPointerMove: 'pointermove',
	MSPointerOut: 'pointerout',
	MSPointerOver: 'pointerover',
	MSPointerUp: 'pointerup'
};

var globalEvents:{
	blur:string;
	click:string;
	doubleclick:string;
	focus:string;
	gotpointercapture?:string;
	input?:string;
	keydown:string;
	keypress:string;
	keyup:string;
	lostpointercapture?:string;
	pointercancel?:string;
	pointerdown:string;
	pointerenter?:string;
	pointerleave?:string;
	pointermove:string;
	pointerout?:string;
	pointerover?:string;
	pointerup:string;
} = {
	blur: undefined,
	click: 'click',
	doubleclick: 'dblclick',
	focus: undefined,
	keydown: 'keydown',
	keypress: 'keypress',
	keyup: 'keyup',
	pointerdown: undefined,
	pointermove: undefined,
	pointerup: undefined
};

if (has('dom-addeventlistener')) {
	globalEvents.blur = 'blur';
	globalEvents.focus = 'focus';
}
else {
	globalEvents.blur = 'focusout';
	globalEvents.focus = 'focusin';
}

if (has('dom-pointerevents')) {
	lang.mixin(globalEvents, {
		gotpointercapture: 'gotpointercapture',
		lostpointercapture: 'lostpointercapture',
		pointercancel: 'pointercancel',
		pointerdown: 'pointerdown',
		pointerenter: 'pointerenter',
		pointerleave: 'pointerleave',
		pointermove: 'pointermove',
		pointerout: 'pointerout',
		pointerover: 'pointerover',
		pointerup: 'pointerup'
	});
}
else if (has('dom-mspointerevents')) {
	lang.mixin(globalEvents, {
		pointerover: 'MSPointerOver',
		pointerenter: 'MSPointerEnter',
		pointerdown: 'MSPointerDown',
		pointermove: 'MSPointerMove',
		pointerup: 'MSPointerUp',
		pointercancel: 'MSPointerCancel',
		pointerout: 'MSPointerOut',
		pointerleave: 'MSPointerLeave',
		gotpointercapture: 'MSGotPointerCapture',
		lostpointercapture: 'MSLostPointerCapture'
	});
}
else if (has('touch')) {
	lang.mixin(globalEvents, {
		pointerdown: 'touchstart',
		pointermove: 'touchmove',
		pointerup: 'touchend',
		pointercancel: 'touchcancel'
	});
}
else {
	lang.mixin(globalEvents, {
		pointerover: 'mouseover',
		pointerenter: 'mouseenter',
		pointerdown: 'mousedown',
		pointermove: 'mousemove',
		pointerup: 'mouseup'
	});
}

var on:(element:Element, type:string, listener:EventListener) => IHandle;
if (has('dom-addeventlistener')) {
	on = function (element:HTMLElement, type:string, listener:EventListener):IHandle {
		element.addEventListener(type, listener, true);
		return {
			remove: function ():void {
				this.remove = function ():void {};
				element.removeEventListener(type, listener, true);
				element = type = listener = null;
			}
		};
	};
}
else {
	on = function (element:HTMLElement, type:string, listener:EventListener):IHandle {
		element.attachEvent('on' + type, function ():void {
			listener.call(this, window.event);
		});

		return {
			remove: function ():void {
				this.remove = function ():void {};
				element.detachEvent('on' + type, listener);
				element = type = listener = null;
			}
		};
	};
}

//function createEvent(currentTarget:Widget, type:string, listener:EventListener):IHandle {
	// For pointer input,
	// Events are always just added to the root node.
	// To find the right node for the event…
	// find the node at the pointer, elementFromPoint first, then
	// find the correct node from getClientRects
	//
	// Things we know:
	// 1. The containing Element
	// 2. The coordinates of the pointer
	//
	// Things we need to know:
	// 1. Where is the nearest widget container?
	//
	// Where can it be?:
	// 1. Comment sibling (nearer than parent node)
	// 2. Parent node
	//
	// Possible DOM structures?:
	//
	// <div Widget 0 gets the event>
	// <!--Widget 1-->
	// <!--Widget 2-->belongs to this widget
	// text node here gets hit
	// <!--/Widget 2-->
	// <!--/Widget 1-->
	// </div>
	//
	// How to find it?:
	// 1. Look for sibling widget comment marker children
	// 2. Create a Range around the contents of the widget markers
	// 3. Get the clientRect for the range
	// 4. Compare if the coordinates of the event are inside the rect
	// 5. Yes? Belongs to widget
	// 6. No? Check if parentNode is a widget
	// 7. Yes? Belongs to widget
	// 8. No? Go to step 1 using parentNode until reaching `Master#root`
//}

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
 * Given a DOM pointer, touch, or mouse event, find the nearest parent widget to the point on the page that emitted the
 * event.
 *
 * @param event The event.
 * @param root The root element for the application. Searches shall never go above this element.
 * @returns The widget at the given point.
 */
function findWidgetFromEvent(event:PointerEvent, root:Element):Widget {
	// Firefox has a non-standard `explicitOriginalTarget` property that we can use to more efficiently discover
	// the target widget, since it allows us to know exactly which node (including text nodes) was hit
	if (event['explicitOriginalTarget']) {
		return findNearestParent(<Node> event['explicitOriginalTarget'], root);
	}

	// Otherwise, we can only get the nearest parent of the nearest Element to the event, and then have to search
	// its children based on the event coordinates to find the true parent widget
	var parent:Widget = findNearestParent(<Node> event.target, root);
	return findWidgetAtPoint(parent, event.clientX, event.clientY);
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

// how does this work?
// 1. widget registers its interest on a global listener when the event occurs at the widget
// 2. global handler is registered for all events of that type on the application, if it does not exist
// 3. widget and associated listener are stored for later
// 4. event happens
// 5. lowest widget for event is discovered
// 6. list of all parent widgets starting from the target is created
// 7. list of listeners is generated in order starting from the target
// 8. for each event, a corrected event is created
// 9. for each entry in the list of listeners, currentTarget is changed to point to the widget, and
//    the event is dispatched until the list is empty or stopPropagation is called and the next widget starts
function handleGlobalEvent(event:UIEvent):void {

}

class Master extends MultiNodeWidget implements IMaster {
	private _globalListeners:{ [eventName:string]:{ [widgetId:string]:IListener[]; }; };
	private _root:Element;
	private _rootListeners:IHandle[];
	private _view:View;

	get:Master.Getters;
	on:Master.Events;
	set:Master.Setters;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'root', 'view' ], 'startup', function (setter:string, value:any):void {
			if (setter === 'view') {
				this._view = value;
			}
		});

		super(kwArgs);
	}

	destroy():void {
		this._view.destroy();
		this._view = this._root = null;
		super.destroy();
	}

	_initialize():void {
		this._globalListeners = {};
		this._rootListeners = [];
		this._root = document.body;
	}

	isGlobalEventType(type:string):boolean {
		return Boolean(globalEvents[type]);
	}

	private _createHandler(listeners:{ [widgetId:string]: IListener[]; }):(event:UIEvent) => void {
		var root = this._root;

		function matchTargets(target:Widget):IListener[] {
			var chain:IListener[] = [];
			do {
				var listener:IListener[];
				if ((listener = listeners[target.get('id')])) {
					chain.push.apply(chain, listener);
				}
			}
			while ((target = target.get('parent')));

			return chain;
		}

		// how does this work?
		// 1. widget registers its interest on a global listener when the event occurs at the widget
		// 2. global handler is registered for all events of that type on the application, if it does not exist
		// 3. widget and associated listener are stored for later
		// 4. event happens
		// 5. lowest widget for event is discovered
		// 6. list of all parent widgets starting from the target is created
		// 7. list of listeners is generated in order starting from the target
		// 8. for each event, a corrected event is created
		// 9. for each entry in the list of listeners, currentTarget is changed to point to the widget, and
		//    the event is dispatched until the list is empty or stopPropagation is called and the next widget starts
		return function (nativeEvent:UIEvent):void {
			var events:core.IEvent[] = <core.IEvent[]> normalizers.match(nativeEvent);
			var event:core.IEvent;

			nextEvent:
			for (var i:number = 0; (event = events[i]); ++i) {
				var targets:IListener[] = matchTargets(event.target);
				var lastTarget:Widget = event.target = findWidgetFromEvent(/* TODO: Fix event interfaces */ <any> event, root);

				for (var j:number = 0, listener:IListener; (listener = targets[i]); ++i) {
					if (listener.widget !== lastTarget && event.propagationStopped) {
						continue nextEvent;
					}

					event.currentTarget = listener.widget;
					listener.callback.call(listener.widget, event);

					if (event.immediatePropagationStopped) {
						continue nextEvent;
					}
				}
			}
		};
	}

	registerGlobalListener(widget:Widget, type:any, callback:core.IEventListener<core.IEvent>):IHandle {
		var globalListeners:{ [widgetId:string]: IListener[]; } = this._globalListeners[type];

		if (!globalListeners) {
			globalListeners = this._globalListeners[type] = {};
			this._rootListeners[type] = on(this._root, globalEvents[type], this._createHandler(globalListeners));
		}

		var widgetId:string = widget.get('id');
		var widgetListeners:IListener[] = globalListeners[widgetId];
		if (!widgetListeners) {
			widgetListeners = globalListeners[widgetId] = [];
		}

		var listener:IListener = { widget: widget, callback: callback };

		widgetListeners.push(listener);

		return {
			remove: function ():void {
				this.remove = function ():void {};
				util.spliceMatch(widgetListeners, listener);
				widgetListeners = listener = null;
			}
		};
	}

	_rootSetter(root:Element):void {
		var key:string;
		for (key in this._rootListeners) {
			this._rootListeners[key].remove();
			this._rootListeners[key] = null;
		}

		var viewNode:Node = this._view && this._view.detach();
		this._root = root;

		if (root && viewNode) {
			root.appendChild(viewNode);
			this._view.set('isAttached', true);

			for (key in this._globalListeners) {
				this._rootListeners[key] = on(root, key, this._createHandler(this._globalListeners[key]));
			}
		}
	}

	startup():IPromise<void> {
		if (typeof this._view === 'string') {
			var self = this;
			return util.getModule(<any> this._view).then(function (view:any):void {
				if (typeof view === 'function') {
					view = new view({ app: self._app });
				}

				self.set('view', view);
			});
		}

		return Promise.resolve<void>(undefined);
	}

	_viewSetter(view:View):void;
	_viewSetter(view:string):void;
	_viewSetter(view:any):void {
		if (this._view && this._view.destroy) {
			this._view.destroy();
		}

		this._view = view;

		if (view && typeof view === 'object') {
			view.set('model', this._app);

			if (this._root) {
				this._root.appendChild(this._view.detach());
				this._view.set('isAttached', true);
			}
		}
	}
}

module Master {
	export interface Events extends MultiNodeWidget.Events, IMaster.Events {}
	export interface Getters extends MultiNodeWidget.Getters, IMaster.Getters {
		(key:'root'):Element;
	}
	export interface Setters extends MultiNodeWidget.Setters, IMaster.Setters {
		(key:'root', value:Element):void;
	}
}

export = Master;
