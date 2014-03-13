import core = require('../../../interfaces');
import dijit = require('../interfaces');

export interface IAccordionContainer extends IStackContainer {
	get:IAccordionContainerGet;
	set:IAccordionContainerSet;
}

export interface IAccordionContainerGet extends IStackContainerGet {
}

export interface IAccordionContainerSet extends IStackContainerSet {
}

export interface IBorderContainer extends ILayoutContainer {
	get:IBorderContainerGet;
	set:IBorderContainerSet;
}

export interface IBorderContainerGet extends ILayoutContainerGet {
	(name:'gutter'):boolean;
	(name:'liveSplitters'):boolean;
	(name:'persist'):boolean;
}

export interface IBorderContainerSet extends ILayoutContainerSet {
	(name:'gutter', value:boolean):void;
	(name:'liveSplitters', value:boolean):void;
	(name:'persist', value:boolean):void;
}

export interface IBorderContainerChild extends ILayoutContainerChild {
	get:IBorderContainerChildGet;
	set:IBorderContainerChildSet;
}

export interface IBorderContainerChildGet extends ILayoutContainerChildGet {
	(name:'splitter'):boolean;
	(name:'minSize'):number;
	(name:'maxSize'):number;
}

export interface IBorderContainerChildSet extends ILayoutContainerChildSet {
	(name:'splitter', value:boolean):void;
	(name:'minSize', value:number):void;
	(name:'maxSize', value:number):void;
}

export interface IContentPane extends dijit.IWidget {
	get:IContentPaneGet;
	set:IContentPaneSet;
}

export interface IContentPaneGet extends dijit.IWidgetGet {
	(name:'href'):string;
	(name:'content'):string;
	(name:'extractContent'):boolean;
	(name:'parseOnLoad'):boolean;
	(name:'parserScope'):string;
	(name:'preventCache'):boolean;
	(name:'preload'):boolean;
	(name:'refreshOnShow'):boolean;
	(name:'loadingMessage'):string;
	(name:'errorMessage'):string;
}

export interface IContentPaneSet extends dijit.IWidgetSet {
	(name:'href', value:string):void;
	(name:'content', value:string):void;
	(name:'extractContent', value:boolean):void;
	(name:'parseOnLoad', value:boolean):void;
	(name:'parserScope', value:string):void;
	(name:'preventCache', value:boolean):void;
	(name:'preload', value:boolean):void;
	(name:'refreshOnShow', value:boolean):void;
	(name:'loadingMessage', value:string):void;
	(name:'errorMessage', value:string):void;
}

export interface ILayoutContainer extends ILayoutWidget {
	get:ILayoutContainerGet;
	set:ILayoutContainerSet;
}

export interface ILayoutContainerGet extends ILayoutWidgetGet {
	(name:'design'):string;
}

export interface ILayoutContainerSet extends ILayoutWidgetSet {
	(name:'design', value:string):void;
}

export interface ILayoutContainerChild extends ILayoutWidgetChild {
	get:ILayoutContainerChildGet;
	set:ILayoutContainerChildSet;
}

export interface ILayoutContainerChildGet extends ILayoutWidgetChildGet {
	(name:'region'):string;
	(name:'layoutPriority'):number;
}

export interface ILayoutContainerChildSet extends ILayoutWidgetChildSet {
	(name:'region', value:string):void;
	(name:'layoutPriority', value:number):void;
}

export interface ILayoutWidget extends dijit.IWidget {
	get:ILayoutWidgetGet;
	set:ILayoutWidgetSet;
}

export interface ILayoutWidgetGet extends dijit.IWidgetGet {
}

export interface ILayoutWidgetSet extends dijit.IWidgetSet {
}

export interface ILayoutWidgetChild extends core.IObservable {
	get:ILayoutWidgetGet;
	set:ILayoutWidgetSet;
}

export interface ILayoutWidgetChildGet extends core.IObservableGet {
}

export interface ILayoutWidgetChildSet extends core.IObservableSet {
}

export interface IStackContainer extends ILayoutWidget {
	get:IStackContainerGet;
	set:IStackContainerSet;
}

export interface IStackContainerGet extends ILayoutWidgetGet {
	(name:'selected'):boolean;
	(name:'disabled'):boolean;
	(name:'closable'):boolean;
	(name:'iconClass'):string;
	(name:'showTitle'):boolean;
}

export interface IStackContainerSet extends ILayoutWidgetSet {
	(name:'selected', value:boolean):void;
	(name:'design', value:boolean):void;
	(name:'closable', value:boolean):void;
	(name:'iconClass', value:string):void;
	(name:'showTitle', value:boolean):void;
}

export interface IStackContainerChild extends ILayoutWidgetChild {
	get:IStackContainerChildGet;
	set:IStackContainerChildSet;
}

export interface IStackContainerChildGet extends ILayoutWidgetChildGet {
	(name:'selected'):boolean;
	(name:'disabled'):boolean;
	(name:'closable'):boolean;
	(name:'iconClass'):string;
	(name:'showTitle'):boolean;
}

export interface IStackContainerChildSet extends ILayoutWidgetChildSet {
	(name:'selected', value:boolean):void;
	(name:'design', value:boolean):void;
	(name:'closable', value:boolean):void;
	(name:'iconClass', value:string):void;
	(name:'showTitle', value:boolean):void;
}

export interface ITabContainer extends ITabContainerBase {
	get:ITabContainerGet;
	set:ITabContainerSet;
}

export interface ITabContainerGet extends ITabContainerBaseGet {
	(name:'useMenu'):boolean;
	(name:'useSlider'):boolean;
}

export interface ITabContainerSet extends ITabContainerBaseSet {
	(name:'useMenu', value:boolean):void;
	(name:'useSlider', value:boolean):void;
}

export interface ITabContainerBase extends IStackContainer {
	get:ITabContainerBaseGet;
	set:ITabContainerBaseSet;
}

export interface ITabContainerBaseGet extends IStackContainerGet {
	(name:'tabPosition'):string;
	(name:'tabStrip'):boolean;
	(name:'nested'):boolean;
}

export interface ITabContainerBaseSet extends IStackContainerSet {
	(name:'tabPosition', value:string):void;
	(name:'tabStrip', value:boolean):void;
	(name:'nested', value:boolean):void;
}
