import domUtil = require('../util');
import has = require('../../../has');
import lang = require('dojo/_base/lang');
import ui = require('../../interfaces');
import util = require('../../../util');

enum Keys {
	ALT = 18,
	COMMAND_LEFT = 91,
	COMMAND_RIGHT = 93,
	CONTROL = 17,
	META = 224,
	SHIFT = 16
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

function createModifierSetter(value:boolean):EventListener {
	return function (event:KeyboardEvent):void {
		var isMac:boolean = navigator.platform.indexOf('Mac') === 0;
		switch (event.keyCode) {
			case Keys.ALT:
				keyboard.alt = value;
				break;
			case Keys.COMMAND_LEFT:
			case Keys.COMMAND_RIGHT:
			case Keys.META:
				keyboard.meta = value;
				keyboard.shortcut = value && isMac;
				break;
			case Keys.CONTROL:
				keyboard.control = value;
				keyboard.shortcut = value && !isMac;
				break;
			case Keys.SHIFT:
				keyboard.shift = value;
				break;
		}
	};
}

function keyDiff(oldObject:PointerManager.Pointer, newObject:PointerManager.Pointer):PointerManager.Changes {
	return {
		buttons: oldObject.buttons !== newObject.buttons,
		clientX: oldObject.clientX !== newObject.clientX,
		clientY: oldObject.clientY !== newObject.clientY,
		height: oldObject.height !== newObject.height,
		pressure: oldObject.pressure !== newObject.pressure,
		tiltX: oldObject.tiltX !== newObject.tiltX,
		tiltY: oldObject.tiltY !== newObject.tiltY,
		width: oldObject.width !== newObject.width
	};
}

function mixin(target:PointerManager.Pointer, source:PointerManager.Pointer):PointerManager.Pointer {
	// TS7017
	var _target:any = target;
	var _source:any = source;
	for (var key in _source) {
		if (key === 'lastState' || key === 'lastChanged') {
			continue;
		}
		else if (key === 'modifiers') {
			_target[key] = lang.mixin({}, _source[key]);
		}
		else {
			_target[key] = _source[key];
		}
	}

	return _target;
}

var keyboard:ui.PointerEvent.Modifiers = {
	alt: false,
	control: false,
	meta: false,
	shift: false,
	shortcut: false
};

var nativeEventMap:HashMap<string> = {
	mousedown: 'change',
	mouseenter: 'add',
	mouseleave: 'remove',
	mousemove: 'change',
	mouseup: 'change',
	MSPointerCancel: 'cancel',
	MSPointerDown: 'change',
	MSPointerEnter: 'add',
	MSPointerHover: 'change',
	MSPointerLeave: 'remove',
	MSPointerMove: 'change',
	MSPointerUp: 'change',
	pointercancel: 'cancel',
	pointerdown: 'change',
	pointerenter: 'add',
	pointerleave: 'remove',
	pointermove: 'change',
	pointerup: 'change',
	touchcancel: 'cancel',
	touchend: 'remove',
	touchmove: 'change',
	touchstart: 'add'
};

class PointerManager {
	private _handles:IHandle[] = [];
	private _listeners:{ [type:string]:PointerManager.Listener[]; };
	pointers:{
		[pointerId:number]:PointerManager.Pointer;
		numActive:number;
	};

	private static _keyboardActive:boolean = false;

	constructor(root:EventTarget) {
		var handles:IHandle[] = this._handles = [];
		this._listeners = {};
		var pointers:{
			[pointerId:number]:PointerManager.Pointer;
			numActive:number;
		} = this.pointers = { numActive: 0 };
		var self = this;

		// TODO: Maybe not all information should be cleared from the pointer? Due to issues with cancel/touchend where
		// necessary properties disappeared before emitting the event
		function clearPointer(pointerId:number):PointerManager.Pointer {
			var pointer:PointerManager.Pointer = pointers[pointerId];
			mixin(pointer.lastState, pointer);
			for (var key in pointer) {
				if (key === 'lastState' || key === 'pointerId' || key === 'pointerType' || key === 'timestamp') {
					continue;
				}

				// TS7017
				(<any> pointer)[key] = null;
			}

			pointer.isActive = false;
			--pointers.numActive;
			return pointer;
		}

		if (!PointerManager._keyboardActive) {
			domUtil.on(window, 'keydown', createModifierSetter(true));
			domUtil.on(window, 'keyup', createModifierSetter(false));
			PointerManager._keyboardActive = true;
		}

		if (has('dom-pointerevents') || has('dom-mspointerevents')) {
			var pointerChanged = function (event:PointerEvent):void {
				// Since we are listening on capture phase we need to discard child events that do not belong to us
				if (event.type === (has('dom-pointerevents') ? 'pointerenter' : 'MSPointerEnter') && event.target !== root) {
					return;
				}

				var pointer:PointerManager.Pointer = pointers[event.pointerId];
				if (!pointer) {
					pointer = pointers[event.pointerId] = <any> { lastChanged: [], lastState: {} };
				}

				if (!pointer.isActive) {
					if (has('dom-pointerevents')) {
						(<Element> root).setPointerCapture(event.pointerId);
					}
					else /* has('dom-mspointerevents') */ {
						(<Element> root).msSetPointerCapture(event.pointerId);
					}

					pointer.isActive = true;
					++pointers.numActive;
				}

				pointer.lastState = mixin(pointer.lastState, pointer);
				pointer.buttons = event.buttons;
				pointer.clientX = event.clientX;
				pointer.clientY = event.clientY;
				pointer.height = event.height;
				pointer.isPrimary = event.isPrimary;
				pointer.modifiers = lang.mixin(<ui.PointerEvent.Modifiers> {}, keyboard),
				pointer.pointerId = event.pointerId;
				pointer.pointerType = event.pointerType;
				pointer.pressure = event.pressure;
				pointer.tiltX = event.tiltX;
				pointer.tiltY = event.tiltY;
				pointer.timestamp = event.timeStamp;
				pointer.width = event.width;
				pointer.lastChanged = keyDiff(pointer.lastState, pointer);

				self._emit(event, pointer);
			};

			var pointerRemoved = function (event:PointerEvent):void {
				// Since we are listening on capture phase we need to discard child events that do not belong to us
				if (event.type === (has('dom-pointerevents') ? 'pointerleave' : 'MSPointerLeave') && event.target !== root) {
					return;
				}

				var pointer:PointerManager.Pointer = clearPointer(event.pointerId);
				self._emit(event, pointer);
			};

			if (has('dom-pointerevents')) {
				handles.push(
					domUtil.on(root, 'pointercancel', pointerRemoved),
					domUtil.on(root, 'pointerdown', pointerChanged),
					domUtil.on(root, 'pointerenter', pointerChanged),
					domUtil.on(root, 'pointerleave', pointerRemoved),
					domUtil.on(root, 'pointermove', pointerChanged),
					domUtil.on(root, 'pointerup', pointerChanged)
				);
			}
			else /* has('dom-mspointerevents') */ {
				handles.push(
					domUtil.on(root, 'MSPointerCancel', pointerRemoved),
					domUtil.on(root, 'MSPointerDown', pointerChanged),
					domUtil.on(root, 'MSPointerEnter', pointerChanged),
					domUtil.on(root, 'MSPointerHover', pointerChanged),
					domUtil.on(root, 'MSPointerLeave', pointerRemoved),
					domUtil.on(root, 'MSPointerMove', pointerChanged),
					domUtil.on(root, 'MSPointerUp', pointerChanged)
				);
			}
		}
		else {
			if (has('dom-touch')) {
				var primaryId:number;
				var FINGER_SIZE:number = 22;
				var touchChanged = function (event:TouchEvent):void {
					// Mouse is currently controlling, stop and ignore touch events
					if (pointers[NaN] && pointers[NaN].isActive) {
						event.preventDefault();
						return;
					}

					for (var i:number = 0, touch:TouchEvent.Touch; (touch = event.changedTouches[i]); ++i) {
						var pointer:PointerManager.Pointer = pointers[touch.identifier];
						if (!pointer) {
							pointer = pointers[touch.identifier] = <any> { lastChanged: [], lastState: {} };
						}

						if (!pointer.isActive) {
							pointer.isActive = true;
							++pointers.numActive;
						}

						if (!primaryId) {
							primaryId = touch.identifier;
						}

						pointer.lastState = mixin(pointer.lastState, pointer);
						pointer.buttons = 1;
						pointer.clientX = touch.clientX;
						pointer.clientY = touch.clientY;
						pointer.height = FINGER_SIZE;
						pointer.isPrimary = touch.identifier === primaryId;
						pointer.modifiers = lang.mixin(<ui.PointerEvent.Modifiers> {}, keyboard),
						pointer.pointerId = touch.identifier;
						pointer.pointerType = 'touch';
						pointer.pressure = 0.5;
						pointer.tiltX = 0;
						pointer.tiltY = 0;
						pointer.timestamp = event.timeStamp;
						pointer.width = FINGER_SIZE;
						pointer.lastChanged = keyDiff(pointer.lastState, pointer);

						self._emit(event, pointer);
					}
				};

				var touchRemoved = function (event:TouchEvent):void {
					event.preventDefault();

					for (var i:number = 0, touch:TouchEvent.Touch; (touch = event.changedTouches[i]); ++i) {
						var pointer:PointerManager.Pointer = clearPointer(touch.identifier);

						// Secondary pointers are not promoted to primary once the primary leaves the surface; a
						// new primary can only exist after all touches are gone
						if (!event.touches.length) {
							primaryId = null;
						}

						self._emit(event, pointer);
					}
				};

				handles.push(
					domUtil.on(root, 'touchcancel', touchRemoved),
					domUtil.on(root, 'touchend', touchRemoved),
					domUtil.on(root, 'touchmove', touchChanged),
					domUtil.on(root, 'touchstart', touchChanged)
				);
			}

			// Android can have both touch screen and mouse simultaneously (Chromebook)
			if (has('dom-mouse')) {
				if (!has('dom-mouse-buttons')) {
					var isButtonPressed:boolean = false;
				}

				var mouseChanged = function (event:MouseEvent):void {
					// Touch is currently controlling, stop and ignore mouse events
					if (pointers.numActive > 0 && (!pointers[NaN] || !pointers[NaN].isActive)) {
						event.preventDefault();
						return;
					}

					if (!has('dom-mouse-buttons')) {
						if (event.type === 'mousedown') {
							isButtonPressed = true;
						}
						else if (event.type === 'mouseup') {
							isButtonPressed = false;
						}
					}

					var pointer:PointerManager.Pointer = pointers[NaN];
					if (!pointer) {
						pointer = pointers[NaN] = <any> { lastChanged: [], lastState: {} };
					}

					// If the pointer is already active it should never be activated again
					if (event.type === 'mouseenter' && pointer.isActive) {
						return;
					}

					if (!pointer.isActive) {
						pointer.isActive = true;
						++pointers.numActive;
					}

					pointer.lastState = mixin(pointer.lastState, pointer);

					if (has('dom-mouse-buttons')) {
						pointer.buttons = event.buttons;
					}
					else {
						// `buttons` API: 1 = LMB, 2 = *R*MB, 4 = *M*MB, ...
						// `button` API:  0 = LMB, 1 = *M*MB, 2 = *R*MB, ...
						// So, we need to reverse MMB and RMB
						var buttonMap: HashMap<number> = {
							1: 2,
							2: 1
						};
						pointer.buttons = isButtonPressed ? Math.pow(2, buttonMap[event.button] || event.button) : 0;
					}

					pointer.clientX = event.clientX;
					pointer.clientY = event.clientY;
					pointer.height = 0;
					pointer.isPrimary = true;
					pointer.modifiers = lang.mixin(<ui.PointerEvent.Modifiers> {}, keyboard),
					pointer.pointerId = NaN;
					pointer.pointerType = 'mouse';
					pointer.pressure = pointer.buttons > 0 ? 0.5 : 0;
					pointer.tiltX = 0;
					pointer.tiltY = 0;
					pointer.timestamp = event.timeStamp || /* has('ie') === 8 */ +new Date();
					pointer.width = 0;
					pointer.lastChanged = keyDiff(pointer.lastState, pointer);

					self._emit(event, pointer);
				};

				var mouseRemoved = function (event:MouseEvent):void {
					// Since we are listening on capture phase we need to discard child events that do not belong to us
					if (event.type === 'mouseleave' && event.target !== root) {
						return;
					}

					var pointer:PointerManager.Pointer = clearPointer(NaN);
					self._emit(event, pointer);
				};

				handles.push(
					domUtil.on(root, 'mousedown', mouseChanged),
					domUtil.on(root, 'mouseenter', mouseChanged),
					domUtil.on(root, 'mouseleave', mouseRemoved),
					domUtil.on(root, 'mousemove', mouseChanged),
					domUtil.on(root, 'mouseup', mouseChanged)
				);

				if (has('dom-dblclick-bug')) {
					handles.push(domUtil.on(root, 'dblclick', function (event:MouseEvent):void {
						// since the `type` property is being changed, we must copy to a fake event, since trying to
						// modify this property is immutable on the native object
						var fakeEvent:MouseEvent = <any> {
							button: 0,
							clientX: event.clientX,
							clientY: event.clientY,
							target: event.target,
							type: 'mousedown'
						};

						mouseChanged(fakeEvent);
						fakeEvent.type = 'mouseup';
						mouseChanged(fakeEvent);
					}));
				}

				// it is impossible to know whether or not the mouse button was released outside the window without
				// `buttons` but at least we can know if it was released anywhere in the window
				if (!has('dom-mouse-buttons')) {
					handles.push(
						domUtil.on(window, 'mouseup', function (event:MouseEvent):void {
							isButtonPressed = false;
						}),
						domUtil.on(window, 'mouseleave', function (event:MouseEvent):void {
							if (event.target === window) {
								isButtonPressed = false;
							}
						})
					);
				}
			}
		}
	}

	destroy():void {
		this.destroy = function ():void {};
		var handle:IHandle;
		while ((handle = this._handles.pop())) {
			handle.remove();
		}
		this._handles = this._listeners = null;
	}

	private _emit(event:Event, pointer:PointerManager.Pointer):void {
		var type:string = nativeEventMap[event.type];

		var listeners:PointerManager.Listener[] = this._listeners[type];
		if (!listeners) {
			return;
		}

		for (var i:number = 0, listener:PointerManager.Listener; (listener = listeners[i]); ++i) {
			if (listener.call(this, pointer)) {
				event.preventDefault();
			}
		}
	}

	on(type:'add', listener:PointerManager.Listener):IHandle;
	on(type:'cancel', listener:PointerManager.Listener):IHandle;
	on(type:'change', listener:PointerManager.Listener):IHandle;
	on(type:'remove', listener:PointerManager.Listener):IHandle;
	on(type:string, listener:PointerManager.Listener):void;
	on(type:string, listener:PointerManager.Listener):IHandle {
		var listeners:PointerManager.Listener[] = this._listeners[type];
		if (!listeners) {
			listeners = this._listeners[type] = [];
		}

		listeners.push(listener);
		return util.createHandle(function () {
			util.spliceMatch(listeners, listener);
			listeners = listener = null;
		});
	}
}

module PointerManager {
	export interface Changes {
		buttons:boolean;
		clientX:boolean;
		clientY:boolean;
		height:boolean;
		pressure:boolean;
		tiltX:boolean;
		tiltY:boolean;
		width:boolean;
	}

	export interface Listener {
		(pointer:PointerManager.Pointer):boolean;
	}

	export interface Pointer {
		buttons:number;
		clientX:number;
		clientY:number;
		height:number;
		isActive:boolean;
		isPrimary:boolean;
		lastChanged:PointerManager.Changes;
		lastState:Pointer;
		modifiers:ui.PointerEvent.Modifiers;
		pointerId:number;
		pointerType:string;
		pressure:number;
		tiltX:number;
		tiltY:number;
		timestamp:number;
		width:number;
	}
}

export = PointerManager;
