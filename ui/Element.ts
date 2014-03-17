/// <amd-dependency path="./renderer!StyledComponent" />
declare var require:any;

import Composite = require('./Composite');
var Renderer = require('./renderer!StyledComponent');
import ui = require('./interfaces');

/* abstract */ class Element extends Composite implements ui.IElement {
	classList:ui.style.IClassList;
	_classListHandle:IHandle;
	style:ui.style.IStyle;
	_styleHandle:IHandle;

	_fragmentGetter():Node {
		// TODO: always detach when requesting a fragment?
		// this.detach();
		return this.get('firstNode');
	}

	get:ui.IElementGet;

	set:ui.IElementSet;
}

Element.prototype._renderer = new Renderer();

export = Element;
