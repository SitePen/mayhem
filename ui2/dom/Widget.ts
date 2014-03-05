import ElementRenderer = require('./ElementRenderer');
import dom = require('./interfaces');
import UiWidget = require('../Widget');

class DomWidget extends UiWidget implements dom.IWidget {
	/* protected */ _firstNode:Node;
	/* protected */ _fragment:DocumentFragment;
	/* protected */ _lastNode:Node;
}

DomWidget.prototype._renderer = new ElementRenderer();

export = DomWidget;
