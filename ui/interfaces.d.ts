import AddPosition = require('./AddPosition');
import core = require('../interfaces');
export import data = require('../data/interfaces');
import PlacePosition = require('./PlacePosition');
export import style = require('./style/interfaces');

export interface IBindArguments {
	/**
	 * The binding string for the property being bound on the source object. The binding string can be any arbitrary
	 * string but is typically an identifier or expression. The data binding registry in use determines whether or not
	 * the specified binding string is valid.
	 */
	sourceBinding:string;

	/**
	 * The target object to bind to (defaulting to the view itself)
	 */
	target?:Object;

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

export interface IComposite extends IView {
	get:ICompositeGet;
	set:ICompositeSet;
}

export interface ICompositeGet extends IViewGet {
}

export interface ICompositeSet extends IViewSet {
}

export interface IContainer extends IMediated {
	children:IWidget[];

	add(item:IWidget, position:AddPosition):IHandle;
	add(item:IWidget, position:number):IHandle;
	add(item:IWidget, placeholder?:any):IHandle;
	empty():void;
	get:IContainerGet;
	remove(index:number):void;
	remove(widget:IWidget):void;
	set:IContainerSet;
}

export interface IContainerGet extends IMediatedGet {
}

export interface IContainerSet extends IMediatedSet {
}

export interface IElement extends IComposite {
	classList:style.IClassList;
	style:style.IStyle;
	// TODO: stash on renderer instance
	_classListHandle:IHandle;
	_styleHandle:IHandle;

	get:IElementGet;
	set:IElementSet;
}

export interface IElementGet extends ICompositeGet {
	(name:'firstNode'):HTMLElement;
	(name:'lastNode'):HTMLElement;
	(name:'fragment'):HTMLElement;
}

export interface IElementSet extends ICompositeSet {
}

export interface IMaster extends IView {
	attachToWindow(referenceNode:Node):IHandle;
	get:IMasterGet;
	set:IMasterSet;
}

export interface IMasterGet extends IViewGet {
}

export interface IMasterSet extends IViewSet {
}

export interface IMediated extends IWidget {
	attach(widget:IWidget):void;
	get:IMediatedGet;
	set:IMediatedSet;
}

export interface IMediatedArgs extends IWidgetArgs {
	mediator?:data.IMediator;
}

export interface IMediatedGet extends IWidgetGet {
	(name:'mediator'):data.IMediator;
}

export interface IMediatedSet extends IWidgetSet {
	(name:'mediator', value:data.IMediator):void;
}

export interface IPlaceholder extends IMediated {
	empty():void;
	get:IPlaceholderGet;
	set:IPlaceholderSet;
}

export interface IPlaceholderGet extends IMediatedGet {
	(name:'widget'):IWidget;
}

export interface IPlaceholderSet extends IMediatedSet {
	(name:'widget', value:IWidget):void;
}

export interface IRenderer {
	add(widget:IContainer, item:IWidget, referenceItem:IWidget, position:any):void;
	attachToWindow(widget:IMediated, window:any):void;
	clear(widget:IWidget):void;
	destroy(widget:IWidget):void;
	detach(widget:IWidget):void;
	getContent(widget:IComposite):Node;
	getTextContent(widget:IComposite):string;
	initialize(widget:IWidget):void;
	remove(widget:IContainer, item:IWidget):void;
	render(widget:IWidget, options?:any):void;
	setAttribute(widget:IElement, name:string, value:string):void;
	setBody(widget:IWidget, content:Node):void;
	setBodyText(widget:IWidget, text:string):string;
}

export interface IRenderOptions {
	fragment?:Node;
	elementType?:string;
}

export interface IView extends IContainer {
	placeholders:{ [name:string]: IPlaceholder; };

	add(item:IWidget, placeholder:string):IHandle;
	add(item:IWidget, referenceNode:Node):IHandle;
	add(item:IWidget, position?:any):IHandle;
	bind(kwArgs:IBindArguments):IHandle;
	clear():void;
	get:IViewGet;
	set:IViewSet;
}

export interface IViewGet extends IContainerGet {
	(name:'content'):Node;
	
}

export interface IViewSet extends IContainerSet {
	(name:'content', value:Node):void;
}

export interface IWidget extends core.IApplicationComponent, core.IEvented {
	destroy():void;
	detach():void;
	get:IWidgetGet;
	placeAt(destination:IWidget, position:PlacePosition):IHandle;
	placeAt(destination:IContainer, position:number):IHandle;
	placeAt(destination:IContainer, placeholder:string):IHandle;
	set:IWidgetSet;
}

export interface IWidgetArgs /*extends core.IApplicationComponentArgs*/ {
	attached?:boolean;
	firstNode?:Node;
	fragment?:DocumentFragment;
	id?:string;
	lastNode?:Node;
	parent?:IContainer;
	index?:number;
	next?:IWidget;
	previous?:IWidget;
}

export interface IWidgetGet extends core.IApplicationComponentGet {
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

export interface IWidgetSet extends core.IApplicationComponentSet {
	(name:'attached', value:boolean):void;
	(name:'id', value:string):void;
	(name:'parent', value:IContainer):void;
}
