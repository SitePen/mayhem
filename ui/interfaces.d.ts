/// <reference path="../dojo" />

export import AddPosition = require('./AddPosition');
import BackgroundRepeat = require('./BackgroundRepeat');
import BindDirection = require('../binding/BindDirection');
import core = require('../interfaces');
export import PlacePosition = require('./PlacePosition');

export interface IClassList extends core.IProxty<string> {
	add(className:string):void;
	has(className:string):boolean;
	remove(className:string):void;
	toggle(className:string, forceState?:boolean):void;
}

export interface IContentContainer extends IWidgetContainer {
	_content:DocumentFragment;
}

export interface IDomWidget extends IWidget, core.IApplicationComponent {
	_firstNode:Node;
	_lastNode:Node;

	detach():Node;
	clear():void;
}

export interface IElementWidget extends IDomWidget {
	_elementType:string;
	_firstNode:HTMLElement;
	_lastNode:HTMLElement;

	detach():Node; // HTMLElement
}

export interface IFragmentWidget extends IDomWidget {
	_firstNode:Comment;
	_fragment:DocumentFragment;
	_lastNode:Comment;

	detach():Node; // DocumentFragment
}

export interface IPlaceholder extends IFragmentWidget {
	// _content:IDomWidget;

	// get(key:'content'):IDomWidget;
}

export interface IWidget extends core.IObservableEvented {
	_classList:IClassList;
	_style:IStyle;

	// get(key:'id'):string;
	// get(key:'index'):number;
	// get(key:'mediator'):core.IMediator;
	// set(key:'mediator', value:core.IMediator):void;
	// get(key:'next'):IWidget;
	// get(key:'parent'):IWidgetContainer;
	// get(key:'previous'):IWidget;

	bind(targetBinding:string, binding:string, options?:{ direction?:BindDirection; }):IHandle;
	bind(targetBinding:Node, binding:string, options?:{ direction?:BindDirection; }):IHandle;

	destroy():void;
	extract():void;

	placeAt(destination:IWidget, position:PlacePosition):IHandle;
	placeAt(destination:IWidgetContainer, position:number):IHandle;
	placeAt(destination:IWidgetContainer, placeholder:string):IHandle;
	resize?(bounds?:{ width:number; height:number; }):void;
}

// TODO: ideally this only needs to extend core.IObservable
export interface IWidgetContainer extends IDomWidget {
	/* protected */ _children:IDomWidget[];
	/* protected */ _placeholders:{ [name:string]: IPlaceholder; };

	add(widget:IWidget, position:AddPosition):IHandle;
	add(widget:IWidget, position:number):IHandle;
	add(widget:IWidget, placeholder:string):IHandle;

	/* protected */ _addToContainer(widget:IWidget, reference:IWidget):void;
	/* protected */ _addToContainer(widget:IWidget, reference:Node):void;
	/* protected */ _addToContainer(widget:IWidget, reference:any):void;

	/* protected */ _createPlaceholder(name:string, node:Node):IPlaceholder;

	empty():void;

	remove(index:number):void;
	remove(widget:IWidget):void;
}

/* Style */

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

export interface IStyle extends core.IObservable {
	// Combined styles interface for multiple platform support
	background?: IBackgroundStyle;
	textColor?: IColor;
	/* etc. */

	observe(observer:core.IObserver<any>):IHandle;
	observe(key:string, observer:core.IObserver<any>):IHandle;
}
