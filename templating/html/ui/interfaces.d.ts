import ui = require('../../../ui/interfaces');

export interface IIterator extends ui.IElement {
	get:IIteratorGet;
	set:IIteratorSet;
}

export interface IIteratorGet extends ui.IElementGet {
}

export interface IIteratorSet extends ui.IElementSet {
}
