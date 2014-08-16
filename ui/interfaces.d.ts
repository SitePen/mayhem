import core = require('../interfaces');
import Master = require('./Master');
import Widget = require('./Widget');

export interface PointerEvent extends UIEvent {
	buttons:number;
	clientX:number;
	clientY:number;
	height:number;
	isPrimary:boolean;
	modifiers:PointerEvent.Modifiers;
	pointerId:number;
	pointerType:string;
	pressure:number;
	relatedTarget?:Widget;
	tiltX:number;
	tiltY:number;
	width:number;
}

export declare module PointerEvent {
	export interface Modifiers {
		alt:boolean;
		control:boolean;
		meta:boolean;
		shift:boolean;
		shortcut:boolean;
	}
}

export interface UIEvent extends core.IEvent {
	currentTarget:Widget;
	target:Widget;
	view:Master;
}
