/// <reference path="../dojo" />

import BindDirection = require('../binding/BindDirection');
import binding = require('../binding/interfaces');
import core = require('../interfaces');
import ObservableEvented = require('../ObservableEvented');
import PlacePosition = require('./PlacePosition');
import Style = require('./style/Style');
import style = require('./style/interfaces');

export interface IClassList extends core.IProxty<string> {
	add(className:string):void;
	has(className:string):boolean;
	remove(className:string):void;
	toggle(className:string, forceState?:boolean):void;
}

export interface IComponentWidget extends IElementWidget, IContentComponent {
}

export interface IContainer extends core.IObservable {
	/* protected */ _children:IDomWidget[];

	add(widget:IWidget, position:PlacePosition):IHandle;
	add(widget:IWidget, position:number):IHandle;
	add(widget:IWidget, placeholder:string):IHandle;

	get(key:string):any;

	empty():void;

	remove(index:number):void;
	remove(widget:IWidget):void;
}

export interface IContainerWidget extends IContentWidget, IContainer {
	_childPlaceholders:IPlaceholder[];
}

export interface IContentComponent extends ITextBindingWidget, IContainerWidget, IPlaceholdingWidget {

}

export interface IContentWidget extends IDomWidget {
	_contentFragment:DocumentFragment;
	_contentString:string;

	setContent(value:string):void;

	clear():void;
} 

export interface IDomWidget extends IWidget, core.IApplicationComponent {
	_classList:IClassList;
	_firstNode:Node;
	_lastNode:Node;
	_style:Style;

	// get(key:'classList'):IClassList;
	// get(key:'firstNode'):Node;
	// get(key:'lastNode'):Node;
	// get(key:'style'):Style;

	detach():Node;
}

export interface IElementWidget extends IDomWidget {
	// note: this represents framework/ui/dom/SingleNodeWidget, NOT framework/ui/dom/Element
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

export interface IPaneWidget extends IViewWidget {
	_selected:boolean;
	_keepScrollPosition:boolean;
}

export interface IPlaceholder extends IFragmentWidget {
	_content:IDomWidget;

	// get(key:'content'):IDomWidget;
}

export interface IPlaceholdingWidget extends IContentWidget, IContainer {
	 _namedPlaceholders:{ [key:string]: IPlaceholder };

	 // get(key:'namedPlaceholders'):{ [key:string]: IPlaceholder };
}

export interface ITextBindingWidget extends IContentWidget {
	_textBindingNodes:Node[];
	_textBindingHandles:IHandle[];
	_textBindingPaths:string[];
}

export interface IViewWidget extends IFragmentWidget, IContentComponent {
}

export interface IWidget extends core.IObservableEvented {
	// get(key:'id'):string;
	// get(key:'index'):number;
	// get(key:'mediator'):core.IMediator;
	// get(key:'activeMediator'):core.IMediator; // represents the actual, active mediator being used by widget
	// set(key:'mediator', value:core.IMediator):void;
	// get(key:'next'):IWidget;
	// get(key:'parent'):IContainer;
	// get(key:'previous'):IWidget;

	bind(propertyName:string, binding:string, options?:{ direction:BindDirection; }):IHandle;
	destroy():void;
	detach():void;
	clear():void;

	placeAt(destination:IWidget, position:PlacePosition):IHandle;
	placeAt(destination:IContainer, position:number):IHandle;
	placeAt(destination:IContainer, placeholder:string):IHandle;
	resize?(bounds?:{ width:number; height:number; }):void;
}
