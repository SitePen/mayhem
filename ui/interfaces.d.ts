import AddPosition = require('./AddPosition');
import core = require('../interfaces');
import data = require('../data/interfaces');
import form = require('./form/interfaces');
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

export interface IContainer extends IView {
	get:IContainerGet;
	set:IContainerSet;

	add(item:IWidget, position:AddPosition):IHandle;
	add(item:IWidget, position:number):IHandle;
	add(item:IWidget, position?:any):IHandle;
	empty():void;
	getChild(index:number):IWidget;
	getChildIndex(item:IWidget):number;
	nextChild(item:IWidget):IWidget;
	previousChild(item:IWidget):IWidget;
	remove(index:number):void;
	remove(widget:IWidget):void;
}

export interface IContainerGet extends IViewGet {
	(name:'children'):IWidget[];
}

export interface IContainerSet extends IViewSet {
}

export interface IContentView extends IContainer {
	placeholders:{ [name:string]: IPlaceholder; };
	get:IContentViewGet;
	set:IContentViewSet;

	add(item:IWidget, placeholder:string):IHandle;
	add(item:IWidget, position:AddPosition):IHandle;
	add(item:IWidget, position:number):IHandle;
	add(item:IWidget, position?:any):IHandle;
	clear():void;
	setContent(content:any):void;
}

export interface IContentViewGet extends IContainerGet {
}

export interface IContentViewSet extends IContainerSet {
}

export interface IMaster extends IContentView {
	attachToWindow(target:any):IHandle;
}

export interface IView extends IWidget {
	get:IViewGet;
	set:IViewSet;

	bind(kwArgs:IBindArguments):IHandle;
}

export interface IViewGet extends IWidgetGet {
	(name:'mediator'):core.data.IMediator;
}

export interface IViewSet extends IWidgetSet {
	(name:'mediator', value:core.data.IMediator):void;
}

export interface IPlaceholder extends IContainer {
	get:IPlaceholderGet;
	set:IPlaceholderSet;

	empty():void;
}

export interface IPlaceholderGet extends IContainerGet {
	(name:'currentChild'):IWidget;
}

export interface IPlaceholderSet extends IContainerSet {
	(name:'currentChild', value:IWidget):void;
}

export interface IRenderer {
	add(widget:IContainer, item:IWidget, position?:any):void;
	attachContent(widget:IWidget):void;
	attachStyles(widget:IWidget):void;
	attachToWindow(widget:IWidget, target:any):void;
	clear(widget:IWidget):void;
	destroy(widget:IWidget):void;
	detach(widget:IWidget):void;
	detachContent(widget:IWidget):void;
	detachStyles(widget:IWidget):void;
	initialize(widget:IWidget):void;
	remove(widget:IContainer, item:IWidget):void;
	render(widget:IWidget):void;
	setContent(widget:IWidget, content:any):void;
}

export interface ITextView extends IView {
	get:ITextViewGet;
	set:ITextViewSet;
}

export interface ITextViewGet extends IViewGet {
	(name:'formattedText'):string;
	(name:'text'):string;
}

export interface ITextViewSet extends IViewSet {
	(name:'formattedText', value:string):void;
	(name:'text', value:string):void;
}

export interface IWidget extends core.IApplicationComponent, core.IEvented, core.IManagedDestroyable {
	get:IWidgetGet;
	set:IWidgetSet;

	detach():void;
	placeAt(destination:IWidget, position:PlacePosition):IHandle;
	placeAt(destination:IContainer, position:number):IHandle;
	placeAt(destination:IContainer, placeholder:string):IHandle;
}

export interface IWidgetGet extends core.IApplicationComponentGet {
	(name:'attached'):boolean;
	(name:'id'):string;
	(name:'parent'):IContainer;
	(name:'index'):number;
	(name:'next'):IWidget;
	(name:'previous'):IWidget;
	(name:'visible'):boolean;
}

export interface IWidgetSet extends core.IApplicationComponentSet {
	(name:'attached', value:boolean):void;
	(name:'id', value:string):void;
	(name:'parent', value:IContainer):void;
	(name:'visible', value:boolean):void;
}

/* Control flow */

export interface IConditional extends IPlaceholder {
	get:IConditionalGet;
	set:IConditionalSet;
}

export interface IConditionalGet extends IPlaceholderGet {
	(name:'alternate'):IWidget;
	(name:'condition'):string;
	(name:'consequent'):IContentView;
	(name:'result'):boolean;
}

export interface IConditionalSet extends IPlaceholderSet {
	(name:'alternate', value:IWidget):void;
	(name:'condition', value:string):void;
	(name:'consequent', value:IContentView):void;
	(name:'result', value:boolean):void;
}

// TODO: IIterator should extend IAdaptiveContainer instead
export interface IIterator extends IContentView {
	get:IIteratorGet;
	set:IIteratorSet;
}

export interface IIteratorGet extends IContentViewGet {
	(name:'each'):string;
	(name:'in'):string;
	(name:'source'):any;
	(name:'template'):any;
}

export interface IIteratorSet extends IContentViewSet {
	(name:'each', value:string):void;
	(name:'in', value:string):void;
	(name:'source', value:any):void;
	(name:'template', value:any):void;
}

export interface IResolver extends IPlaceholder {
	get:IResolverGet;
	set:IResolverSet;
}

export interface IResolverGet extends IPlaceholderGet {
}

export interface IResolverSet extends IPlaceholderSet {
}
