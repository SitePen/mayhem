import core = require('../../interfaces');

export interface IBackgroundImage {
	attachment: string /* should be enum */;
	clip: string /* should be enum */;
	origin: string /* should be enum */;
	position: string /* should be enum */;
	repeat: string /* should be enum */;
	size: string /* should be enum */;
	url: string;
}

/* not all widget backends would support all background features; we are just starting with HTML/CSS for now */
export interface IBackgroundStyle {
	color: IColor;
	images: IBackgroundImage[];
}

export /* class */ interface IColor {
	r: number;
	g: number;
	b: number;
	h: number;
	s: number;
	l: number;
	a: number;
	toHex(): string;
	toString(): string;
}

export interface IClassList {
	add(className:string):void;
	has(className:string):boolean;
	remove(className:string):void;
	toggle(className:string, forceState?:boolean):void;
}

export interface IStyle extends core.IObservable {
	// Combined styles interface for multiple platform support
	background?: IBackgroundStyle;
	textColor?: IColor;
	/* etc. */

	observe(observer:core.IObserver<any>):IHandle;
	observe(key:string, observer:core.IObserver<any>):IHandle;
}
