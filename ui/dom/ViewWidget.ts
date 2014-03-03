import ContentContainer = require('./ContentContainer');
import FragmentWidget = require('./FragmentWidget');
import ui = require('../interfaces');
import util = require('../../util');

class ViewWidget extends ContentContainer implements ui.IFragmentWidget {
	/* protected */ _firstNode:Comment;
	/* protected */ _fragment:DocumentFragment;
	/* protected */ _lastNode:Comment;
}

for (var key in FragmentWidget.prototype) {
	if (FragmentWidget.prototype.hasOwnProperty(key)) {
		ViewWidget.prototype[key] = FragmentWidget.prototype[key];
	}
}

export = ViewWidget;
