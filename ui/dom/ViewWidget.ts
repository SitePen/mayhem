import ContentWidget = require('./ContentWidget');
import util = require('../../util');
import ui = require('../interfaces');

class ViewWidget extends ContentWidget implements ui.IViewWidget {
	/* protected */ _content:DocumentFragment;

	constructor(kwArgs:any = {}) {
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

export = ViewWidget;
