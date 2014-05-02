/// <reference path="../../dgrid" />
/// <reference path="../../dijit" />

import List = require('dgrid/List');
import core = require('../../interfaces');
import ui = require('../interfaces');
import _WidgetBase = require('dijit/_WidgetBase');

export interface IWidget extends ui.IWidget {
	_actionHandles:IHandle[];
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

export interface IFragmentWidget extends IContainer {
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

export interface IContentWidget extends IElementWidget, IView {
	_firstNode:HTMLElement;
	_lastNode:HTMLElement;
	_outerFragment:HTMLElement;

	get:ui.IViewGet;
	set:ui.IViewSet;
}

export interface IDialog extends ui.IDialog, IElementWidget {
	get:ui.IDialogGet;
	set:ui.IDialogSet;
}

export interface IImage extends ui.IImage, IElementWidget {
	get:ui.IImageGet;
	set:ui.IImageSet;
}

export interface IList extends ui.IList, IElementWidget {
	_observerHandle:IHandle;

	get:ui.IListGet;
	set:ui.IListSet;
}

export interface IText extends ui.IText, IElementWidget {
	_formattedText:string;
	_text:string;

	get:ui.ITextGet;
	set:ui.ITextSet;
}

export interface IDijitWidget extends IElementWidget {
	_impl:_WidgetBase;
}

/* Control flow */

export interface IIterator extends ui.IIterator, IElementWidget {
	_each:string;
	_factory:any; // TODO: templating.IViewConstructor
	_getModelByKey(key:string):core.data.IMediator;
	_impl:List;
	_modelIndex:{ [key:string]: core.data.IMediator; };
	_source:any;
	_sourceLength:number;
	_sourceObserverHandle:IHandle;
	_template:any;
	_ViewCtor:any; // TODO: templating.IWidgetConstructor
	_widgetIndex:{ [key:string]: IContentWidget; };

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

/* Actions */

export interface IAction {
	name:string;
	role:string;
	triggers:any[];

	attach(widget:IElementWidget):IHandle;
	perform(widget:IElementWidget):void;
}
