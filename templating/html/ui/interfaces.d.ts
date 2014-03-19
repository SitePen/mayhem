export import base = require('../../../ui/interfaces');

export interface IIterator extends base.IView {
	get:IIteratorGet;
	set:IIteratorSet;
}

export interface IIteratorGet extends base.IViewGet {
}

export interface IIteratorSet extends base.IViewSet {
}

export interface IWhen extends base.IView {
	get:IWhenGet;
	set:IWhenSet;
}

export interface IWhenGet extends base.IViewGet {
}

export interface IWhenSet extends base.IViewSet {
}

export interface IConditional extends base.IView {
	get:IConditionalGet;
	set:IConditionalSet;
}

export interface IConditionalGet extends base.IViewGet {
}

export interface IConditionalSet extends base.IViewSet {
}


export interface IView extends base.IView {
	get:IViewGet;
	set:IViewSet;
}

export interface IViewGet extends base.IViewGet {
}

export interface IViewSet extends base.IViewSet {
}
