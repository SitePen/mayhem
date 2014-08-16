/// <reference path="../../dojo" />
import core = require('../../interfaces');
import domUtil = require('./util');
import has = require('../../has');
import IMaster = require('../Master');
import lang = require('dojo/_base/lang');
import MultiNodeWidget = require('./MultiNodeWidget');
import Promise = require('../../Promise');
import ui = require('../interfaces');
import util = require('../../util');
import View = require('./View');
import Widget = require('./Widget');

interface IListener {
	callback:core.IEventListener<core.IEvent>;
	widget:Widget;
}

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

	private _createHandler(listeners:{ [widgetId:string]: IListener[]; }):(event:Event) => void {
		var self = this;
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

		// For pointer input, events are always just added to the root node.
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
		return function (originalEvent:Event):void {
			var events:PointerEvent[] = domUtil.eventNormalizers.match(originalEvent);

			// Currently, for efficiency, Mayhem events converted from native events delegate back to the original
			// instead of creating a new object and copying properties; this means that there is a little confusion
			// since the interface does not conform until we actually go through and reset the view, target, etc.
			// properties
			var event:ui.PointerEvent;

			nextEvent:
			for (var i:number = 0; (event = <any> events[i]); ++i) {
				var currentTarget:Widget = domUtil.findWidgetFromEvent(<any> event, root);
				var targets:IListener[] = matchTargets(currentTarget);

				domUtil.setEventProperty(event, 'view', self);
				domUtil.setEventProperty(event, 'target', currentTarget);
				// TODO: Figure out what to do about relatedTarget which cannot be defined without always storing the
				// last known pointer position somewhere
				// TODO: Moving off a MultiViewWidget to somewhere else won’t dispatch the right events because we
				// still are relying on the browser to do it for us
				// TODO: Redo event system before release to only watch for where the pointers are, then handle
				// literally everything else ourselves :/

				for (var j:number = 0, listener:IListener; (listener = targets[i]); ++i) {
					if (listener.widget !== currentTarget && event.propagationStopped) {
						continue nextEvent;
					}

					domUtil.setEventProperty(event, 'currentTarget', listener.widget);
					listener.callback.call(listener.widget, event);

					if (event.immediatePropagationStopped) {
						continue nextEvent;
					}
				}
			}
		};
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

	registerGlobalListener(widget:Widget, type:any, callback:core.IEventListener<core.IEvent>):IHandle {
		var globalListeners:{ [widgetId:string]: IListener[]; } = this._globalListeners[type];

		if (!globalListeners) {
			globalListeners = this._globalListeners[type] = {};
			this._rootListeners[type] = domUtil.on(this._root, globalEvents[type], this._createHandler(globalListeners));
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
				this._rootListeners[key] = domUtil.on(root, key, this._createHandler(this._globalListeners[key]));
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
