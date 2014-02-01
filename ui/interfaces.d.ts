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
	bind(propertyName:string, binding:string, options?:{ direction:BindDirection; }):IHandle;
	destroy():void;
	detach():void;
	empty():void;
	get(key:'app'):core.IApplication;
	get(key:'classList'):IClassList;
	get(key:'id'):string;
	get(key:'index'):number;
	get(key:'mediator'):core.IMediator;
	get(key:'next'):IWidget;
	get(key:'parent'):IContainerWidget;
	get(key:'previous'):IWidget;
	get(key:'style'):Style;
	get(key:string):any;
	placeAt(destination:IWidget, position:PlacePosition):IHandle;
	placeAt(destination:IContainer, position:number):IHandle;
	placeAt(destination:IContainer, placeholder:string):IHandle;
	resize?(bounds?:{ width:number; height:number; }):void;
	set(kwArgs:{ [key:string]: any; }):any;
	set(key:'app', value:core.IApplication):void;
	set(key:'id', value:string):void;
	set(key:'mediator', value:core.IMediator):void;
	set(key:string, value:any):any;
}
