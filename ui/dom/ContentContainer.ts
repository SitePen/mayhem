import DomWidgetContainer = require('./DomWidgetContainer');
import ElementWidget = require('./ElementWidget');
import ui = require('../interfaces');
import util = require('../../util');

class ContentContainer extends DomWidgetContainer implements ui.IContentContainer {
	_content:DocumentFragment;

	constructor(kwArgs:any) {
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
		// TODO: this._lastNode.parentNode.insertBefore(this._content.cloneNode(true), this._lastNode);
	}
}

export = ContentContainer;
