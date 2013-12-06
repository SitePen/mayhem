import DataBindingDirection = require('../binding/DataBindingDirection');
import style = require('./style/interfaces');
import binding = require('../binding/interfaces');
import core = require('../interfaces');
import AddPosition = require('./AddPosition');
import PlacePosition = require('./PlacePosition');

export interface IClassList { // stateful array instead?
	add(className:string):void;
	has(className:string):boolean;
	remove(className:string):void;
	toggle(className:string, forceState?:boolean):void;
}

export interface IWidget {
	style:style.IStyle;
	classList:IClassList;
	canHaveChildren?:boolean;
	previous:IWidget;
	next:IWidget;
	parent:IContainer;
	on(eventName:string, callback:(event:CustomEvent) => void):IHandle;
	on(extensionEvent:core.IExtensionEventListener):IHandle;
	emit(event:CustomEvent):void;
	placeAt(destination:IContainer, position?:PlacePosition):IHandle;
	placeAt(destination:IContainer, position?:number):IHandle;
	placeAt(destination:IContainer, placeholder?:string):IHandle;
	bind(propertyName:string, binding:string, options?:{ direction:DataBindingDirection; }):IHandle;
	destroy():void;
}

export interface IContainer extends IWidget {
	add(widget:IWidget, position?:AddPosition):IHandle;
	add(widget:IWidget, position?:number):IHandle;
	children:IWidget[];
	getChildIndex(child:IWidget):number; // not sure about this one. platform limitations?
	remove(childIndex:number):void;      // not sure about this one. platform limitations?
	remove(child:IWidget):void;          // not sure about this one. always use handle?
}

export interface IView extends IWidget {
	mediator:core.IMediator;
}
