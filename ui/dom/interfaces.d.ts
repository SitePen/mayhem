/// <reference path="../../dgrid" />
/// <reference path="../../dijit" />

export import dgrid_IList = require('dgrid/List');
import core = require('../../interfaces');
export import form = require('./form/interfaces');
import ui = require('../interfaces');
export import IDijitWidgetImpl = require('dijit/_WidgetBase');

export interface IWidget extends ui.IWidget {
	_firstNode:Node;
	_fragment:Node;
	_lastNode:Node;
}

export interface IContainer extends ui.IContainer, IMediated {
	get:ui.IContainerGet;
	set:ui.IContainerSet;
}

export interface IPlaceholdingWidget extends IContainer {
	_firstNode:Comment;
	_fragment:DocumentFragment;
	_lastNode:Comment;
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

export interface IMediatedElementWidget extends IElementWidget, IMediated {
	_firstNode:HTMLElement;
	_fragment:HTMLElement;
	_lastNode:HTMLElement;

	get:ui.IMediatedGet;
	set:ui.IMediatedSet;
}

export interface IDijitWidget extends IElementWidget {
	_impl:IDijitWidgetImpl;
}

/* Conrol flow */

export interface IIterator extends ui.IIterator, IElementWidget {
	_factory:any; // TODO: templating.IViewConstructor
	_getMediatorByKey(key:string):core.data.IMediator;
	_list:dgrid_IList;
	_listLength:number;
	_mediatorIndex:{ [key:string]: core.data.IMediator; };
	_sourceObserverHandle:IHandle;
	_values:ui.IIteratorValues;
	_widgetIndex:{ [key:string]: IMediatedElementWidget; };

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
