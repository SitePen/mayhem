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
	// TODO: TS#2153
	// get(key:'children'):IWidget[];
	// get(key:'placeholders'):{ [ id:string ]:IPlaceholder };

	add(widget:IWidget, position:PlacePosition):IHandle;
	add(widget:IWidget, position:number):IHandle;
	add(widget:IWidget, placeholder:string):IHandle;
	empty():void;
	remove(index:number):void;
	remove(widget:IWidget):void;
}

export interface IContainerWidget extends IWidget, IContainer {}

export interface IDomWidget extends IWidget {
	get(key:'firstNode'):Node; // Comment|Element
	get(key:'lastNode'):Node; // Comment|Element

	// TODO: Fix compiler to not require this
	get(key:'app'):core.IApplication;
	get(key:'classList'):IClassList;
	get(key:'id'):string;
	get(key:'index'):number;
	get(key:'mediator'):core.IMediator;
	set(key:'mediator', value:core.IMediator):void;
	get(key:'next'):IWidget;
	get(key:'parent'):IContainerWidget;
	get(key:'previous'):IWidget;
	get(key:'style'):Style;

	detach():Node; // Element|DocumentFragment

	get(key:string):any;

	set(kwArgs:{ [key:string]: any; }):void;
	set(key:string, value:any):void;
}

export interface IPlaceholder extends IWidget {
	// TODO: TS#2153
	// get(key:'content'):IWidget;
	// set(key:'content', value:IWidget):void;
}

export interface IWidget extends ObservableEvented {
	get(key:'app'):core.IApplication;
	get(key:'classList'):IClassList;
	get(key:'id'):string;
	get(key:'index'):number;
	get(key:'mediator'):core.IMediator;
	set(key:'mediator', value:core.IMediator):void;
	get(key:'next'):IWidget;
	get(key:'parent'):IContainerWidget;
	get(key:'previous'):IWidget;
	get(key:'style'):Style;

	bind(propertyName:string, binding:string, options?:{ direction:BindDirection; }):IHandle;
	destroy():void;
	detach():void;
	empty():void;

	get(key:string):any;

	placeAt(destination:IWidget, position:PlacePosition):IHandle;
	placeAt(destination:IContainer, position:number):IHandle;
	placeAt(destination:IContainer, placeholder:string):IHandle;
	resize?(bounds?:{ width:number; height:number; }):void;

	set(kwArgs:{ [key:string]: any; }):void;
	set(key:string, value:any):void;
}
