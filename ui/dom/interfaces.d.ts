/// <reference path="../../dgrid" />
/// <reference path="../../dijit" />

import List = require('dgrid/List');
import core = require('../../interfaces');
import ui = require('../interfaces');
import _WidgetBase = require('dijit/_WidgetBase');

export interface IWidget extends ui.IWidget {
	_classListHandle:IHandle;
	_innerFragment:Node;
	_firstNode:Node;
	_lastNode:Node;
	_outerFragment:Node;
	_renderer:ui.IRenderer;
	_styleHandle:IHandle;
}

export interface IContainer extends ui.IContainer, IView {
	get:ui.IContainerGet;
	set:ui.IContainerSet;
}

export interface IPlaceholdingWidget extends IContainer {
	_firstNode:Comment;
	_lastNode:Comment;
	_outerFragment:DocumentFragment;
}

export interface IElementWidget extends IWidget {
	_firstNode:HTMLElement;
	_lastNode:HTMLElement;
	_outerFragment:HTMLElement;
}

export interface IView extends ui.IView, IWidget {
	get:ui.IViewGet;
	set:ui.IViewSet;
}

export interface IViewWidget extends IElementWidget, IView {
	_firstNode:HTMLElement;
	_lastNode:HTMLElement;
	_outerFragment:HTMLElement;

	get:ui.IViewGet;
	set:ui.IViewSet;
}

export interface ITextView extends ui.ITextView, IElementWidget {
	_formattedText:string;
	_text:string;

	get:ui.ITextViewGet;
	set:ui.ITextViewSet;
}

export interface IDijitWidget extends IElementWidget {
	_impl:_WidgetBase;
}

/* Control flow */

export interface IIterator extends ui.IIterator, IElementWidget {
	_each:string;
	_factory:any; // TODO: templating.IViewConstructor
	_getMediatorByKey(key:string):core.data.IMediator;
	_in:string;
	_list:List;
	_listLength:number;
	_mediatorIndex:{ [key:string]: core.data.IMediator; };
	_source:any;
	_sourceObserverHandle:IHandle;
	_template:any;
	_widgetIndex:{ [key:string]: IViewWidget; };

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
