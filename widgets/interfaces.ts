/// <reference path="../interfaces.ts" />
/// <reference path="../binding/interfaces.ts" />

interface IStyle {
	// Combined styles interface for multiple platform support
	background: IBackgroundStyle;
	textColor: IColor;
	/* etc. */
}

/* class */ interface IColor {
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

/* not all widget backends would support all background features; we are just starting with HTML/CSS for now */
interface IBackgroundStyle {
	color: IColor;
	images: IBackgroundImage[];
}

interface IBackgroundImage {
	attachment: string /* should be enum */;
	clip: string /* should be enum */;
	origin: string /* should be enum */;
	position: string /* should be enum */
	repeat: BackgroundRepeat;
	size: string /* should be enum */
	url: string;
}

enum BackgroundRepeat {
	X,
	Y,
	XY,
	NONE
}

interface IClassList { // stateful array instead?
	add(className:string): void;
	has(className:string): boolean;
	remove(className:string): void;
	toggle(className:string, forceState?:boolean): void;
}

interface IExtensionEvent extends CustomEvent {}

interface IExtensionEventListener {
	(target:IWidget, callback:(event:IExtensionEvent) => void): IHandle;
}

enum AddPosition {
	FIRST = -1,
	LAST = -2
}

enum PlacePosition {
	FIRST = -1,
	LAST = -2,
	BEFORE = -3,
	AFTER = -4,
	ONLY = -5,
	REPLACE = -6
}

interface IWidget {
	style: IStyle;
	classList: IClassList;
	constructor(kwArgs:Object): void;
	canHaveChildren?:boolean;
	previous: IWidget;
	next: IWidget;
	parent: IContainer;
	on(eventName:string, callback:(event:CustomEvent) => void): IHandle;
	on(extensionEvent:IExtensionEventListener): IHandle;
	emit(event:CustomEvent): void;
	placeAt(destination:IContainer, position?:PlacePosition): IHandle;
	placeAt(destination:IContainer, position?:number): IHandle;
	placeAt(destination:IContainer, placeholder?:string): IHandle;
	bind(propertyName:string, binding:string): IDataBinderHandle;
//	watch(callback:(value:any, oldValue:any, name:string) => any): IHandle; // not sure about this one. dbind? promises?
//	watch(name:string, callback:(value:any, oldValue:any, name:string) => any): IHandle; // not sure about this one. dbind? promises?
	destroy(): void;
}

interface IContainer extends IWidget {
	add(widget:IWidget, position?:AddPosition): IHandle;
	add(widget:IWidget, position?:number): IHandle;
	children: IWidget[];
	getChildIndex(child:IWidget): number; // not sure about this one. platform limitations?
	remove(childIndex:number): void;     // not sure about this one. platform limitations?
	remove(child:IWidget): void;          // not sure about this one. always use handle?
}

interface IView extends IWidget {
	mediator: IMediator;
}
