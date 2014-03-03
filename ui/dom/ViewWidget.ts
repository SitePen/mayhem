import DomWidgetContainer = require('./DomWidgetContainer');
import FragmentWidget = require('./FragmentWidget');
import ui = require('../interfaces');
import util = require('../../util');

class ViewWidget extends FragmentWidget { // implements ui.IWidgetContainer
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
	if (!ViewWidget.prototype[key]) {
		ViewWidget.prototype[key] = DomWidgetContainer.prototype[key];
	}
}

export = ViewWidget;
