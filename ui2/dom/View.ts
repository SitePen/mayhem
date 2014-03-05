import ElementRenderer = require('./ElementRenderer');
import dom = require('./interfaces');
import UiView = require('../View');

class DomView extends UiView implements dom.IView {
	/* protected */ _firstNode:Node;
	/* protected */ _fragment:DocumentFragment;
	/* protected */ _lastNode:Node;
}

DomView.prototype._renderer = new ElementRenderer();

export = DomView;
