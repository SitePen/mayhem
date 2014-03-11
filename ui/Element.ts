/// <amd-dependency path="./renderer!StyledComponent" />
declare var require:any;

import Composite = require('./Composite');
var Renderer = require('./renderer!StyledComponent');
import ui = require('./interfaces');

/* abstract */ class Element extends Composite implements ui.IElement {
	_fragmentGetter():Node {
		// TODO: always detach when requesting a fragment?
		// this.detach();
		return this.get('firstNode');
	}
}

Element.prototype._renderer = new Renderer();

export = Element;
