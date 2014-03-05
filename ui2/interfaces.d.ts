import AddPosition = require('../ui/AddPosition');
import core = require('../interfaces');
import PlacePosition = require('../ui/PlacePosition');

export interface IBindArguments {
	/**
	 * The binding string for the property being bound on the source object. The binding string can be any arbitrary
	 * string but is typically an identifier or expression. The data binding registry in use determines whether or not
	 * the specified binding string is valid.
	 */
	sourceBinding:string;

	/**
	 * The target object to bind to.
	 */
	target:Object;

	/**
	 * The binding string for the property being bound on the target object.
	 */
	targetBinding:string;

	/**
	 * The direction in which the two properties are bound. By default, the direction is `ONE_WAY`, which means that
	 * only the source is bound to the target. A `TWO_WAY` binding keeps the source and target in sync no matter which
	 * changes.
	 */
	twoWay?:boolean;
}

export interface IContainer extends IWidget {
	add(widget:IWidget, position:AddPosition):IHandle;
	add(widget:IWidget, position:number):IHandle;
	add(widget:IWidget, placeholder:string):IHandle;
	empty():void;
	get:IContainerGet;
	remove(index:number):void;
	remove(widget:IWidget):void;
	set:IContainerSet;
}

export interface IContainerGet extends IWidgetGet {
	(name:'children'):IWidget[];
	(name:'mediator'):core.IMediator;
}

export interface IContainerSet extends IWidgetSet {
	(name:'mediator', value:core.IMediator):void;
}

export interface IRenderer {
	add(widget:IContainer, item:IWidget, position:any):void;
	attachToWindow(widget:IContainer, window:any):void;
	destroy(widget:IWidget):void;
	remove(widget:IContainer, item:IWidget):void;
	render(widget:IWidget):void;
}

export interface IView extends IContainer {
	bind(kwArgs:IBindArguments):IHandle;
	get:IViewGet;
	set:IViewSet;
}

export interface IViewGet extends IContainerGet {
	(name:'app'):core.IApplication;
}

export interface IViewSet extends IContainerSet {
	(name:'app', value:core.IApplication):void;
}

export interface IWidget extends core.IObservableEvented {
	destroy():void;
	detach():void;
	get:IWidgetGet;
	placeAt(destination:IWidget, position:PlacePosition):IHandle;
	placeAt(destination:IContainer, position:number):IHandle;
	placeAt(destination:IContainer, placeholder:string):IHandle;
	set:IWidgetSet;
}

export interface IWidgetGet extends core.IObservableSet {
	(name:'attached'):boolean;
	(name:'firstNode'):Node;
	(name:'fragment'):DocumentFragment;
	(name:'id'):string;
	(name:'lastNode'):Node;
	(name:'parent'):IContainer;
	(name:'index'):number;
	(name:'next'):IWidget;
	(name:'previous'):IWidget;
}

export interface IWidgetSet extends core.IObservableSet {
	(name:'attached', value:boolean):void;
	(name:'id', value:string):void;
	(name:'parent', value:IContainer):void;
}
