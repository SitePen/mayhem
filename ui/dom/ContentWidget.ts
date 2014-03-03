import DomWidgetContainer = require('./DomWidgetContainer');
import ElementWidget = require('./ElementWidget');
import ui = require('../interfaces');
import util = require('../../util');

class ContentWidget extends ElementWidget { // implements ui.IContentContainer
	// ui.IContentContainer
	_content:DocumentFragment;
	// ui.IWidgetContainer
	_children:ui.IDomWidget[];
	_placeholders:{ [name:string]: ui.IPlaceholder; };

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

	// ui.IWidgetContainer
	add(widget:ui.IDomWidget, position?:any):IHandle {
		return DomWidgetContainer.prototype.add.apply(this, arguments);
	}
}

// TODO: find a cleaner way to mix Container methods in
for (var key in DomWidgetContainer.prototype) {
	if (!ContentWidget.prototype[key]) {
		ContentWidget.prototype[key] = DomWidgetContainer.prototype[key];
	}
}

export = ContentWidget;
