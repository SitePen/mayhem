import domUtil = require('./util');
import ui = require('../interfaces');
import Widget = require('../Widget');

/* abstract */ class DomWidget extends Widget implements ui.IDomWidget {
	/* protected */ _firstNode:Node;
	/* protected */ _lastNode:Node;

	detach():Node { return }

	clear():void {}
}

export = DomWidget;
