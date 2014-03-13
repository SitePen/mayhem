/// <reference path="../../dijit" />

import core = require('../../interfaces');
import layout = require('./layout/interfaces');
import ui = require('../interfaces');

import _IContainer = require('dijit/_Container');
import _IWidget = require('dijit/_Widget');
export import _IWidgetBase = require('dijit/_WidgetBase');
export interface _IWidgetContainer extends _IContainer, _IWidget {
}

export interface IDijit extends core.IObservable {
	get:IDijitGet;
	set:IDijitSet;
}

export interface IDijitGet extends core.IObservableGet {
	(name:'_dijit'):_IWidgetBase;
	(name:'_dijitConfig'):IDijitConfiguration;
}

export interface IDijitSet extends core.IObservableSet {
	(name:'_dijit', value:_IWidgetBase):void;
	(name:'_dijitConfig', value:IDijitConfiguration):void;
}

export interface IDijitConfiguration {
	Base:any/*typeof ui.IWidget*/;
	Dijit:typeof _IWidgetBase;
	schema:any;
	mixins:any/*Array<typeof ui.IWidget>*/;
	rename:any;
}

export interface IMenuItem extends IWidget {
	get:IMenuItemGet;
	set:IMenuItemSet;
}

export interface IMenuItemGet extends IWidgetGet {
}

export interface IMenuItemSet extends IWidgetSet {
}

export interface IMixin extends IDijit {
	get:IMixinGet;
	set:IMixinSet;
}

export interface IMixinGet extends IDijitGet {
}

export interface IMixinSet extends IDijitSet {
}

export interface IPopupMenuItem extends IMenuItem {
	get:IPopupMenuItemGet;
	set:IPopupMenuItemSet;
}

export interface IPopupMenuItemGet extends IMenuItemGet {
}

export interface IPopupMenuItemSet extends IMenuItemSet {
}

export interface ITitlePane extends layout.IContentPane {
	get:ITitlePaneGet;
	set:ITitlePaneSet;
}

export interface ITitlePaneGet extends layout.IContentPaneGet {
}

export interface ITitlePaneSet extends layout.IContentPaneSet {
}

export interface IWidget extends IWidgetBase {
	get:IWidgetGet;
	set:IWidgetSet;
}

export interface IWidgetGet extends IWidgetBaseGet {
}

export interface IWidgetSet extends IWidgetBaseSet {
}

export interface IWidgetBase extends IDijit, ui.IElement {
	get:IWidgetBaseGet;
	set:IWidgetBaseSet;
}

export interface IWidgetBaseGet extends IDijitGet, ui.IElementGet {
	(name:'class'):string;
	(name:'dir'):string;
	(name:'lang'):string;
	(name:'style'):string;
	(name:'title'):string;
	(name:'tooltip'):string;
}

export interface IWidgetBaseSet extends IDijitSet, ui.IElementSet {
	(name:'class', value:string):void;
	(name:'dir', value:string):void;
	(name:'lang', value:string):void;
	(name:'style', value:string):void;
	(name:'title', value:string):void;
	(name:'tooltip', value:string):void;
}
