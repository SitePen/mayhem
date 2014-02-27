/// <reference path="../dojo" />

import AddPosition = require('./AddPosition');
import BackgroundRepeat = require('./BackgroundRepeat');
import BindDirection = require('../binding/BindDirection');
import core = require('../interfaces');
import PlacePosition = require('./PlacePosition');

export interface IClassList extends core.IProxty<string> {
	add(className:string):void;
	has(className:string):boolean;
	remove(className:string):void;
	toggle(className:string, forceState?:boolean):void;
}

export interface IComponentWidget extends IElementWidget, IContentWidget {
}

export interface IChildContainer extends IContentContainer, IWidgetContainer {
	// _childPlaceholders:IPlaceholder[];
}

export interface IContentContainer extends IDomWidget {
	_content:DocumentFragment;

	clear():void;
}

export interface IContentWidget extends ITextBindingContainer, IChildContainer, IPlaceholdingContainer {

}

export interface IDomWidget extends IWidget, core.IApplicationComponent {
	_classList:IClassList;
	_firstNode:Node;
	_lastNode:Node;
	_style:IStyle;

	// get(key:'classList'):IClassList;
	// get(key:'firstNode'):Node;
	// get(key:'lastNode'):Node;
	// get(key:'style'):IStyle;

	detach():Node;
}

export interface IElementWidget extends IDomWidget {
	_elementType:string;
	_firstNode:Node; // HTMLElement
	_lastNode:Node; // HTMLElement

	// get(key:'elementType'):string;
	// get(key:'firstNode'):Node;
	// get(key:'lastNode'):Node;

	detach():Node; // HTMLElement
}

export interface IFragmentWidget extends IDomWidget {
	_firstNode:Node; // Comment
	_fragment:DocumentFragment;
	_lastNode:Node; // Comment

	// get(key:'firstNode'):Comment;
	// get(key:'fragment'):DocumentFragment;
	// get(key:'lastNode'):Comment;

	detach():Node; // DocumentFragment
}

export interface IPlaceholdingContainer extends IContentContainer, IWidgetContainer {
	// placeholders:{ [key:string]: IPlaceholder };
}

// export interface IPaneWidget extends IViewWidget {
// 	_selected:boolean;
// 	_keepScrollPosition:boolean;
// }

export interface IPlaceholder extends IFragmentWidget {
	// _content:IDomWidget;

	// get(key:'content'):IDomWidget;
}

export interface ITextBindingContainer extends IContentContainer {
	// _textBindingNodes:Node[];
	// _textBindingHandles:IHandle[];
	// _textBindingPaths:string[];
}

export interface IViewWidget extends IFragmentWidget, IContentWidget {
}

export interface IWidget extends core.IObservableEvented {
	// get(key:'id'):string;
	// get(key:'index'):number;
	// get(key:'mediator'):core.IMediator;
	// get(key:'activeMediator'):core.IMediator; // represents the actual, active mediator being used by widget
	// set(key:'mediator', value:core.IMediator):void;
	// get(key:'next'):IWidget;
	// get(key:'parent'):IWidgetContainer;
	// get(key:'previous'):IWidget;

	bind(targetBinding:string, binding:string, options?:{ direction?:BindDirection; }):IHandle;
	bind(targetBinding:Node, binding:string, options?:{ direction?:BindDirection; }):IHandle;

	destroy():void;

	placeAt(destination:IWidget, position:PlacePosition):IHandle;
	placeAt(destination:IWidgetContainer, position:number):IHandle;
	placeAt(destination:IWidgetContainer, placeholder:string):IHandle;
	resize?(bounds?:{ width:number; height:number; }):void;
}

// TODO: ideally this only needs to extend core.IObservable
export interface IWidgetContainer extends IDomWidget {
	/* protected */ _children:IDomWidget[];

	add(widget:IWidget, position:AddPosition):IHandle;
	add(widget:IWidget, position:number):IHandle;
	add(widget:IWidget, placeholder:string):IHandle;

	/* protected */ _addToContainer(widget:IDomWidget, reference:IDomWidget):void;
	/* protected */ _addToContainer(widget:IDomWidget, reference:Node):void;

	createPlaceholder(name:string, node:Node):IPlaceholder;

	get(key:string):any;

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

