import BackgroundRepeat = require('./BackgroundRepeat');

export interface IBackgroundImage {
	attachment: string /* should be enum */;
	clip: string /* should be enum */;
	origin: string /* should be enum */;
	position: string /* should be enum */;
	repeat: BackgroundRepeat;
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

export interface IStyle {
	// Combined styles interface for multiple platform support
	background: IBackgroundStyle;
	textColor: IColor;
	/* etc. */
}
