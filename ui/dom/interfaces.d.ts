/// <reference path="../../dgrid" />
/// <reference path="../../dijit" />

export import IDgridList = require('dgrid/List');
import core = require('../../interfaces');
export import form = require('./form/interfaces');
import ui = require('../interfaces');
export import IDijitWidgetImpl = require('dijit/_WidgetBase');

export interface IContainer extends ui.IContainer, IMediated {
	get:ui.IContainerGet;
	set:ui.IContainerSet;
}

export interface IDijitWidget extends IElementWidget {
	_impl:IDijitWidgetImpl;
}

export interface IElementWidget extends IWidget {
	_classListHandle:IHandle;
	_firstNode:HTMLElement;
	_fragment:HTMLElement;
	_lastNode:HTMLElement;
	_styleHandle:IHandle;
}

export interface IMediated extends ui.IMediated, IWidget {
	get:ui.IMediatedGet;
	set:ui.IMediatedSet;
}

export interface IWidget extends ui.IWidget {
	_firstNode:Node;
	_fragment:DocumentFragment;
	_lastNode:Node;
}


export interface IConditional extends ui.IConditional, IWidget {
	/* protected */ _boundaryNode:Comment;
	/* protected */ _consequentNode:Node;

	get:IConditionalGet;
	set:IConditionalSet;
}

export interface IConditionalGet extends ui.IConditionalGet {
	(name:'alternate'):IWidget;
}

export interface IConditionalSet extends ui.IConditionalSet {
	(name:'alternate', value:IWidget):void;
}

export interface IIterator extends ui.IIterator, IElementWidget {
	///* protected */ _factory:WidgetFactory;
	getWidgetByKey(key:string):IElementWidget;
	/* protected */ _list:IDgridList;
	/* protected */ _listLength:number;
	/* protected */ _mediatorIndex:{ [key:string]: core.data.IMediator; };
	/* protected */ _sourceObserverHandle:IHandle;
	/* protected */ _values:ui.IIteratorValues;
	/* protected */ _widgetIndex:{ [key:string]: IElementWidget; };

	get:IIteratorGet;
	set:IIteratorSet;
}
export interface IIteratorGet extends ui.IIteratorGet {}
export interface IIteratorSet extends ui.IIteratorSet {}

export interface IResolver extends ui.IResolver, IWidget {
	get:IResolverGet;
	set:IResolverSet;
}
export interface IResolverGet extends ui.IResolverGet {}
export interface IResolverSet extends ui.IResolverSet {}
