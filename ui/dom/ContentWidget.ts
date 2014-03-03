import DomWidgetContainer = require('./DomWidgetContainer');
import ElementWidget = require('./ElementWidget');
import ui = require('../interfaces');
import util = require('../../util');

class ContentWidget extends ElementWidget { // implements ui.IWidgetContainer
	/* protected */ _children:ui.IDomWidget[];
	/* protected */ _content:DocumentFragment;
	/* protected */ _placeholders:{ [name:string]: ui.IPlaceholder; };

	constructor(kwArgs?:any) {
		DomWidgetContainer.prototype._initializeContainer.call(this);
		super(kwArgs);
	}

	/* protected */ _contentSetter(content:Node):void {
		this._content = <DocumentFragment> content;
		this._placeContent();
	}

	/* protected */ _placeContent():void {
		this.clear();
		this._lastNode.parentNode.insertBefore(this._content, this._lastNode);
	}
}

for (var key in DomWidgetContainer.prototype) {
	if (!ContentWidget.prototype[key]) {
		ContentWidget.prototype[key] = DomWidgetContainer.prototype[key];
	}
}

export = ContentWidget;
