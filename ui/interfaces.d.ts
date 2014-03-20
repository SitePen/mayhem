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

export interface IContainer extends IMediated {
	get:IContainerGet;
	set:IContainerSet;

	add(item:IWidget, position:AddPosition):IHandle;
	add(item:IWidget, position:number):IHandle;
	add(item:IWidget, position?:any):IHandle;
	empty():void;
	remove(index:number):void;
	remove(widget:IWidget):void;
}

export interface IContainerGet extends IMediatedGet {
	(name:'children'):IWidget[];
}

export interface IContainerSet extends IMediatedSet {
	(name:'children', value:IWidget[]):void;
}

export interface IContainerValues extends IMediatedValues {
	children?:IWidget[];
}

export interface IMediated extends IWidget {
	get:IMediatedGet;
	set:IMediatedSet;

	attach(widget:IWidget):void;
}

export interface IMediatedGet extends IWidgetGet {
	(name:'mediator'):core.data.IMediator;
}

export interface IMediatedSet extends IWidgetSet {
	(name:'mediator', value:core.data.IMediator):void;
}

export interface IMediatedValues extends IWidgetValues {
	mediator?:core.data.IMediator;
}

export interface IPlaceholder extends IMediated {
	get:IPlaceholderGet;
	set:IPlaceholderSet;

	empty():void;
}

export interface IPlaceholderGet extends IMediatedGet {
	(name:'widget'):IWidget;
}

export interface IPlaceholderSet extends IMediatedSet {
	(name:'widget', value:IWidget):void;
}

export interface IRenderer {
	add(widget:IContainer, item:IWidget, position:any):void;
	attachToWindow(widget:IWidget, target:any):void;
	clear(widget:IWidget):void;
	destroy(widget:IWidget):void;
	detach(widget:IWidget):void;
	initialize(widget:IWidget):void;
	remove(widget:IContainer, item:IWidget):void;
	render(widget:IWidget):void;
	setBody(widget:IWidget, content:Node):void;
}

export interface IView extends IContainer {
	placeholders:{ [name:string]: IPlaceholder; };
	get:IViewGet;
	set:IViewSet;

	add(item:IWidget, placeholder:string):IHandle;
	add(item:IWidget, position:AddPosition):IHandle;
	add(item:IWidget, position:number):IHandle;
	add(item:IWidget, position?:any):IHandle;
	attachToWindow(target:any):IHandle;
	bind(kwArgs:IBindArguments):IHandle;
	clear():void;
}

export interface IViewGet extends IContainerGet {
	(name:'content'):any;
}

export interface IViewSet extends IContainerSet {
	(name:'content', value:any):void;
}

export interface IViewValues extends IContainerValues {
	content?:any;
}

export interface IWidget extends core.IApplicationComponent, core.IEvented {
	get:IWidgetGet;
	set:IWidgetSet;

	destroy():void;
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
}

export interface IWidgetSet extends core.IApplicationComponentSet {
	(name:'attached', value:boolean):void;
	(name:'id', value:string):void;
	(name:'parent', value:IContainer):void;
}

export interface IWidgetValues /*extends core.IApplicationComponentValues*/ {
	attached?:boolean;
	id?:string;
	index?:number;
	next?:IWidget;
	parent?:IContainer;
	previous?:IWidget;
}

export interface IViewBindArguments {
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
	direction?:core.binding.IBindDirection;
}

/* Control flow */

export interface IConditional extends IView {
	get:IConditionalGet;
	set:IConditionalSet;
}

export interface IConditionalGet extends IViewGet {
	(name:'alternate'):IWidget;
	(name:'condition'):string;
	(name:'result'):boolean;
}

export interface IConditionalSet extends IViewSet {
	(name:'alternate', value:IWidget):void;
	(name:'condition', value:string):void;
	(name:'result', value:boolean):void;
}

export interface IConditionalValues extends IViewValues {
	alternate?:IWidget;
	condition?:string;
	result?:boolean;
}

export interface IIterator extends IView {
	get:IIteratorGet;
	set:IIteratorSet;

	getWidgetByKey(key:string):IMediated;
}

export interface IIteratorGet extends IViewGet {
	(name:'each'):string;
	(name:'in'):string;
	(name:'source'):any;
	(name:'template'):any;
}

export interface IIteratorSet extends IViewSet {
	(name:'each', value:string):void;
	(name:'in', value:string):void;
	(name:'source', value:any):void;
	(name:'template', value:any):void;
}

export interface IIteratorValues extends IViewValues {
	each?:string;
	in?:string;
	source?:any;
	template?:any;
}

export interface IResolver extends IView {
	get:IResolverGet;
	set:IResolverSet;
}

export interface IResolverGet extends IViewGet {
}

export interface IResolverSet extends IViewSet {
}

export interface IResolverValues extends IViewValues {
}
