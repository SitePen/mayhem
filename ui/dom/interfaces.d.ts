import ui = require('../interfaces');

export interface IComponent extends ui.IComponent {
}

export interface IComposite extends ui.IComposite {
}

export interface IContainer extends ui.IContainer {
}

export interface IElement extends ui.IElement {
}

export interface IMediated extends ui.IMediated {
}

export interface IRenderer extends ui.IRenderer {
	add(widget:IContainer, item:IWidget, referenceItem:IWidget):void;
	attachToWindow(widget:IMediated, node:Node):void;
	clear(widget:IWidget):void;
	destroy(widget:IWidget):void;
	detach(widget:IWidget):void;
	getContent(widget:IComposite):Node;
	getTextContent(widget:IComposite):string;
	insertAt(widget:IContainer, item:IWidget, node:Node):void;
	remove(widget:IContainer, item:IWidget):void;
	render(widget:IWidget, options?:any):void;
	setAttribute(widget:IComponent, name:string, value:string):void;
	setBody(widget:IWidget, content:any /* string | Node */):void;
	setBodyText(widget:IWidget, text:string):string;
}

export interface IRenderOptions extends ui.IRenderOptions {
}

export interface IView extends ui.IView {
}

export interface IWidget extends ui.IWidget {
}
