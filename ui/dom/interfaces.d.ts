import ui = require('../interfaces');

export interface IContainer extends ui.IContainer, IMediated {
	get:ui.IContainerGet;
	set:ui.IContainerSet;
}

export interface IDijitWidget extends IElementWidget {
	_impl:any;
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
