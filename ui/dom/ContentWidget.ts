/// <reference path="../../dojo" />

import domUtil = require('./util');
import ElementWidget = require('./ElementWidget');
import has = require('../../has');
import ui = require('../interfaces');
import util = require('../../util');
import WidgetContainer = require('./WidgetContainer');

class ContentWidget extends ElementWidget {
	/* protected */ _children:ui.IDomWidget[];
	/* protected */ _content:DocumentFragment;
	/* protected */ _placeholders:{ [name:string]: ui.IPlaceholder; };

	constructor(kwArgs:any = {}) {
		this._children || (this._children = []);
		this._placeholders || (this._placeholders = {});
		util.deferMethods(this, [ '_placeContent' ], '_render');
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

for (var key in WidgetContainer.prototype) {
	if (!ContentWidget.prototype[key]) {
		ContentWidget.prototype[key] = WidgetContainer.prototype[key];
	}
}

export = ContentWidget;
