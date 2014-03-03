import ContentContainer = require('./ContentContainer');
import ElementWidget = require('./ElementWidget');
import ui = require('../interfaces');
import util = require('../../util');

class ContentWidget extends ContentContainer implements ui.IElementWidget {
	/* protected */ _elementType:string;
	/* protected */ _firstNode:HTMLElement;
	/* protected */ _lastNode:HTMLElement;
	
}

for (var key in ElementWidget.prototype) {
	if (ElementWidget.prototype.hasOwnProperty(key)) {
		ContentWidget.prototype[key] = ElementWidget.prototype[key];
	}
}

export = ContentWidget;
