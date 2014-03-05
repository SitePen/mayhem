import ElementRenderer = require('./ElementRenderer');
import dom = require('./interfaces');
import UiContainer = require('../Container');

class DomContainer extends UiContainer implements dom.IWidget {
	/* protected */ _firstNode:Node;
	/* protected */ _fragment:DocumentFragment;
	/* protected */ _lastNode:Node;
}

DomContainer.prototype._renderer = new ElementRenderer();

export = DomContainer;
