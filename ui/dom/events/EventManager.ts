import domUtil = require('../util');
import Event = require('../../../Event');
import lang = require('dojo/_base/lang');
import Master = require('../Master');
import KeyboardManager = require('./KeyboardManager');
import PointerManager = require('./PointerManager');
import ui = require('../../interfaces');
import Widget = require('../Widget');

var BUBBLES:HashMap<boolean> = {
	pointercancel: true,
	pointerdown: true,
	pointermove: true,
	pointerout: true,
	pointerover: true,
	pointerup: true
};

var CANCELABLE:HashMap<boolean> = {
	pointerdown: true,
	pointermove: true,
	pointerout: true,
	pointerover: true,
	pointerup: true
};

class EventManager {
	private _handles:IHandle[];
	private _master:Master;
	private _keyboardManager:KeyboardManager;
	private _pointerManager:PointerManager;

	constructor(master:Master) {
		this._master = master;
		var root:Element = master.get('root');
		this._pointerManager = new PointerManager(root);
		this._keyboardManager = new KeyboardManager(root);
		this._handles = [
			this._pointerManager.on('add', lang.hitch(this, '_handlePointerAdd')),
			this._pointerManager.on('cancel', lang.hitch(this, '_handlePointerCancel')),
			this._pointerManager.on('change', lang.hitch(this, '_handlePointerChange')),
			this._pointerManager.on('remove', lang.hitch(this, '_handlePointerRemove')),
			this._keyboardManager.on('down', lang.hitch(this, '_emitKeyboardEvent', 'keydown')),
			this._keyboardManager.on('repeat', lang.hitch(this, '_emitKeyboardEvent', 'keyrepeat')),
			this._keyboardManager.on('up', lang.hitch(this, '_emitKeyboardEvent', 'keyup'))
		];
	}

	destroy() {
		this.destroy = function () {};
		this._pointerManager.destroy();
		this._keyboardManager.destroy();
	}

	private _emitKeyboardEvent(type:string, keyInfo:KeyboardManager.KeyInfo):boolean {
		var target:Widget = domUtil.findNearestParent(this._master, document.activeElement);

		// HTML-LS 6.4.6 Focus management APIs
		// If there is nothing else focused in a page, then the focused element is either the body, the document
		// element, or null. In these cases these keyboard events are "global" and so should be passed to this
		// application master UI for processing
		if (
			!document.activeElement ||
			document.activeElement === document.body ||
			document.activeElement === document.documentElement
		) {
			target = this._master;
		}

		if (!target) {
			return;
		}

		var event:ui.KeyboardEvent = <any> new Event({
			bubbles: true,
			cancelable: true,
			char: keyInfo.char,
			code: keyInfo.code,
			currentTarget: target,
			// TODO: modifiers
			key: keyInfo.key,
			keyType: 'keyboard',
			target: target,
			type: type,
			view: this._master
		});

		return !event.currentTarget.emit(event);
	}

	private _emitPointerEvent(type:string, pointer:PointerManager.Pointer, target?:Widget, relatedTarget?:Widget):boolean {
		if (!target) {
			target = domUtil.findWidgetAt(this._master, pointer.clientX, pointer.clientY);
		}

		var event:ui.PointerEvent = <any> new Event({
			bubbles: BUBBLES[type],
			button: pointer.lastState.buttons ^ pointer.buttons,
			buttons: pointer.buttons,
			cancelable: CANCELABLE[type],
			clientX: pointer.clientX,
			clientY: pointer.clientY,
			currentTarget: target,
			height: pointer.height,
			isPrimary: pointer.isPrimary,
			modifiers: pointer.modifiers,
			pointerId: pointer.pointerId,
			pointerType: pointer.pointerType,
			pressure: pointer.pressure,
			relatedTarget: relatedTarget || null,
			target: target,
			tiltX: pointer.tiltX,
			tiltY: pointer.tiltY,
			type: type,
			view: this._master,
			width: pointer.width
		});

		return !event.currentTarget.emit(event);
	}

	private _handlePointerAdd(pointer:PointerManager.Pointer):boolean {
		var target:Widget = domUtil.findWidgetAt(this._master, pointer.clientX, pointer.clientY);

		if (!target) {
			target = this._master;
		}

		var shouldCancel:boolean = this._emitPointerEvent('pointerover', pointer, target);

		this._emitPointerEvent('pointerenter', pointer, target);

		if (pointer.pointerType === 'touch') {
			if (this._emitPointerEvent('pointerdown', pointer, target)) {
				shouldCancel = true;
			}
		}

		return shouldCancel;
	}

	private _handlePointerCancel(pointer:PointerManager.Pointer):boolean {
		var target:Widget = domUtil.findWidgetAt(this._master, pointer.lastState.clientX, pointer.lastState.clientY);

		if (!target) {
			target = this._master;
		}

		var shouldCancel:boolean = this._emitPointerEvent('pointercancel', pointer, target);

		if (this._emitPointerEvent('pointerout', pointer, target)) {
			shouldCancel = true;
		}

		this._emitPointerEvent('pointerleave', pointer, target);

		return shouldCancel;
	}

	private _handlePointerChange(pointer:PointerManager.Pointer):boolean {
		var target:Widget = domUtil.findWidgetAt(this._master, pointer.clientX, pointer.clientY) || this._master;
		var previousTarget:Widget;
		var changes:PointerManager.Changes = pointer.lastChanged;
		var shouldCancel:boolean = false;
		var hasMoved:boolean = changes.clientX || changes.clientY;

		if (hasMoved) {
			previousTarget = domUtil.findWidgetAt(this._master, pointer.lastState.clientX, pointer.lastState.clientY)
				|| this._master;
		}

		if (hasMoved && target !== previousTarget) {
			if (this._emitPointerEvent('pointerout', pointer, previousTarget, target)) {
				shouldCancel = true;
			}

			this._emitPointerEvent('pointerleave', pointer, previousTarget, target);
		}

		if (this._emitPointerEvent('pointermove', pointer, target)) {
			shouldCancel = true;
		}

		if (hasMoved && target !== previousTarget) {
			if (this._emitPointerEvent('pointerover', pointer, target, previousTarget)) {
				shouldCancel = true;
			}

			this._emitPointerEvent('pointerenter', pointer, target, previousTarget);
		}

		if (changes.buttons) {
			if (pointer.buttons > 0 && pointer.lastState.buttons === 0) {
				if (this._emitPointerEvent('pointerdown', pointer, target)) {
					shouldCancel = true;
				}
			}
			else if (pointer.buttons === 0 && pointer.lastState.buttons > 0) {
				if (this._emitPointerEvent('pointerup', pointer, target)) {
					shouldCancel = true;
				}
			}
		}

		return shouldCancel;
	}

	private _handlePointerRemove(pointer:PointerManager.Pointer):boolean {
		var target:Widget = domUtil.findWidgetAt(this._master, pointer.lastState.clientX, pointer.lastState.clientY)
			|| this._master;

		var shouldCancel:boolean = false;

		if (pointer.pointerType === 'touch') {
			shouldCancel = this._emitPointerEvent('pointerup', pointer.lastState, target);
		}

		if (this._emitPointerEvent('pointerout', pointer, target)) {
			shouldCancel = true;
		}

		return shouldCancel;
	}
}

export = EventManager;
