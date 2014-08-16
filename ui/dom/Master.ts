/// <reference path="../../dojo" />
import core = require('../../interfaces');
import EventManager = require('./EventManager');
import has = require('../../has');
import IMaster = require('../Master');
import lang = require('dojo/_base/lang');
import MultiNodeWidget = require('./MultiNodeWidget');
import Promise = require('../../Promise');
import util = require('../../util');
import View = require('./View');
import Widget = require('./Widget');

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
	private _eventManager:EventManager;
	private _root:Element;
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
		this._root = document.body;
	}

	private _initializeView():void {
		this._root.appendChild(this._view.detach());
		this._view.set('isAttached', true);

		// TODO: Changing root after loading EventManager once will break things right now, it needs to be
		// much more graceful
		this._eventManager = new EventManager(this);
	}

	_rootSetter(root:Element):void {
		this._root = root;
		root && this._view && this._initializeView();
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

			this._root && this._initializeView();
		}
	}
}

module Master {
	export interface Events extends MultiNodeWidget.Events, IMaster.Events {}
	export interface Getters extends MultiNodeWidget.Getters, IMaster.Getters {
		(key:'eventManager'):EventManager;
		(key:'root'):Element;
	}
	export interface Setters extends MultiNodeWidget.Setters, IMaster.Setters {
		(key:'root', value:Element):void;
	}
}

export = Master;
