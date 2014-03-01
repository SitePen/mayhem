import util = require('../../util');
import ui = require('../interfaces');
import WidgetContainer = require('./WidgetContainer');

class ViewWidget extends WidgetContainer {
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
		console.log(this._content.cloneNode(true))
		this.clear();
		this._lastNode.parentNode.insertBefore(this._content, this._lastNode);
	}
}

export = ViewWidget;
