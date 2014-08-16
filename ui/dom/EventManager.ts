import core = require('../../interfaces');
import domUtil = require('./util');
import Event = require('../../Event');
import lang = require('dojo/_base/lang');
import Master = require('./Master');
import PointerManager = require('./PointerManager');
import ui = require('../interfaces');
import util = require('../../util');
import Widget = require('./Widget');

var BUBBLES = {
	pointercancel: true,
	pointerdown: true,
	pointermove: true,
	pointerout: true,
	pointerover: true,
	pointerup: true
};

var CANCELABLE = {
	pointerdown: true,
	pointermove: true,
	pointerout: true,
	pointerover: true,
	pointerup: true
};

class EventManager {
	private _handles:IHandle[];
	private _master:Master;
	private _pointerManager:PointerManager;

	constructor(master:Master) {
		this._master = master;
		this._pointerManager = new PointerManager(master.get('root'));
		this._handles = [
			this._pointerManager.on('add', lang.hitch(this, '_handleAdd')),
			this._pointerManager.on('cancel', lang.hitch(this, '_handleCancel')),
			this._pointerManager.on('change', lang.hitch(this, '_handleChange')),
			this._pointerManager.on('remove', lang.hitch(this, '_handleRemove'))
		];
	}

	private _createEvent(type:string, pointer:PointerManager.Pointer, target?:Widget, relatedTarget?:Widget):ui.PointerEvent {
		if (!target) {
			target = domUtil.findWidgetAt(this._master, pointer.clientX, pointer.clientY);
		}

		return <any> new Event({
			bubbles: BUBBLES[type],
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
	}

	private _emit(type:string, pointer:PointerManager.Pointer, target?:Widget, relatedTarget?:Widget):boolean {
		var event:ui.PointerEvent = this._createEvent(type, pointer, target, relatedTarget);
		return !event.currentTarget.emit(event);
	}

	private _handleAdd(pointer:PointerManager.Pointer):boolean {
		var target:Widget = domUtil.findWidgetAt(this._master, pointer.clientX, pointer.clientY);

		if (!target) {
			return false;
		}

		var shouldCancel:boolean = this._emit('pointerover', pointer, target);

		this._emit('pointerenter', pointer, target);

		if (pointer.pointerType === 'touch') {
			if (this._emit('pointerdown', pointer, target)) {
				shouldCancel = true;
			}
		}

		return shouldCancel;
	}

	private _handleCancel(pointer:PointerManager.Pointer):boolean {
		var target:Widget = domUtil.findWidgetAt(this._master, pointer.lastState.clientX, pointer.lastState.clientY);

		if (!target) {
			return false;
		}

		var shouldCancel:boolean = this._emit('pointercancel', pointer, target);

		if (this._emit('pointerout', pointer, target)) {
			shouldCancel = true;
		}

		this._emit('pointerleave', pointer, target);

		return shouldCancel;
	}

	private _handleChange(pointer:PointerManager.Pointer):boolean {
		var target:Widget = domUtil.findWidgetAt(this._master, pointer.clientX, pointer.clientY);

		if (!target) {
			return false;
		}

		var previousTarget:Widget;
		var changes:PointerManager.Changes = pointer.lastChanged;
		var shouldCancel:boolean = false;
		var hasMoved:boolean = changes.clientX || changes.clientY;

		if (hasMoved) {
			previousTarget = domUtil.findWidgetAt(this._master, pointer.lastState.clientX, pointer.lastState.clientY);
		}

		if (hasMoved && target !== previousTarget) {
			if (this._emit('pointerout', pointer, previousTarget, target)) {
				shouldCancel = true;
			}

			this._emit('pointerleave', pointer, previousTarget, target);
		}

		if (this._emit('pointermove', pointer, target)) {
			shouldCancel = true;
		}

		if (hasMoved && target !== previousTarget) {
			if (this._emit('pointerover', pointer, target, previousTarget)) {
				shouldCancel = true;
			}

			this._emit('pointerenter', pointer, target, previousTarget);
		}

		if (changes.buttons) {
			if (pointer.buttons > 0 && pointer.lastState.buttons === 0) {
				if (this._emit('pointerdown', pointer, target)) {
					shouldCancel = true;
				}
			}
			else if (pointer.buttons === 0 && pointer.lastState.buttons > 0) {
				if (this._emit('pointerup', pointer, target)) {
					shouldCancel = true;
				}
			}
		}

		return shouldCancel;
	}

	private _handleRemove(pointer:PointerManager.Pointer):boolean {
		var target:Widget = domUtil.findWidgetAt(this._master, pointer.lastState.clientX, pointer.lastState.clientY);

		if (!target) {
			return false;
		}

		var shouldCancel:boolean = false;

		if (pointer.pointerType === 'touch') {
			shouldCancel = this._emit('pointerup', pointer, target);
		}

		if (this._emit('pointerout', pointer, target)) {
			shouldCancel = true;
		}

		return shouldCancel;
	}
}

export = EventManager;
