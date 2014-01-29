import BindDirection = require('../binding/BindDirection');
import binding = require('../binding/interfaces');
import core = require('../interfaces');
import ObservableEvented = require('../ObservableEvented');
import PlacePosition = require('./PlacePosition');
import style = require('./style/interfaces');

export interface IClassList { // stateful array instead?
	add(className:string):void;
	has(className:string):boolean;
	remove(className:string):void;
	toggle(className:string, forceState?:boolean):void;
}

export interface IContainer {
	children:IWidget[];
	placeholders:{ [ id:string ]:IPlaceholder };

	add(widget:IWidget, position:PlacePosition):IHandle;
	add(widget:IWidget, position:number):IHandle;
	add(widget:IWidget, placeholder:string):IHandle;
	empty():void;
	remove(index:number):void;
	remove(widget:IWidget):void;
}

export interface IContainerWidget extends IWidget, IContainer {}

export interface IDomWidget extends IWidget {
	firstNode:Node; // Comment|Element
	// TODO: good reason not to force lastNode? SingleNodeWidget already implements it
	lastNode:Node; // Comment|Element

	detach():Node; // Element|DocumentFragment
}

export interface IPlaceholder extends IWidget {
	content:IWidget;
}

export interface IView extends IWidget {
	mediator:core.IMediator;
}

export interface IWidget extends ObservableEvented {
	canHaveChildren?:boolean;
	classList:IClassList;
	id:string;
	index:number;
	// TODO: Not sure there should be a hard dependency on mediator for widgets
	mediator:core.IMediator;
	next:IWidget;
	parent:IContainer;
	previous:IWidget;
	style:style.IStyle;

	bind(propertyName:string, binding:string, options?:{ direction:BindDirection; }):IHandle;
	destroy():void;
	detach():void;
	empty():void;
	placeAt(destination:IWidget, position:PlacePosition):IHandle;
	placeAt(destination:IContainer, position:number):IHandle;
	placeAt(destination:IContainer, placeholder:string):IHandle;
	resize?(bounds?:{ width:number; height:number; }):void;
}
