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

export interface IContainer extends IWidget {
	add(widget:IWidget, position:AddPosition):IHandle;
	add(widget:IWidget, position:number):IHandle;
	add(widget:IWidget, placeholder:string):IHandle;
	children:IWidget[];
	getChildIndex(child:IWidget):number; // not sure about this one. platform limitations?
	remove(childIndex:number):void;      // not sure about this one. platform limitations?
	remove(child:IWidget):void;          // not sure about this one. always use handle?
}

export interface IView extends IWidget {
	mediator:core.IMediator;
}

export interface IWidget extends IStateful, IEvented {
	// TODO: Not sure there should be a hard dependency on mediator for widgets
	canHaveChildren?:boolean;
	classList:IClassList;
	mediator:core.IMediator;
	next:IWidget;
	parent:IContainer;
	previous:IWidget;
	style:style.IStyle;

	bind(propertyName:string, binding:string, options?:{ direction:DataBindingDirection; }):IHandle;
	destroy():void;
	placeAt(destination:IContainer, position:PlacePosition):IHandle;
	placeAt(destination:IContainer, position:number):IHandle;
	placeAt(destination:IContainer, placeholder:string):IHandle;
	resize?(bounds?:{ width:number; height:number; }):void;
}
