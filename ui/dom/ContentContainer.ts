/// <reference path="../../dojo" />

import DomWidgetContainer = require('./DomWidgetContainer');
import ElementWidget = require('./ElementWidget');
import ui = require('../interfaces');
import util = require('../../util');

class ContentContainer extends DomWidgetContainer implements ui.IContentContainer {
	/* protected */ _content:Node;

	constructor(kwArgs:any) {
		util.deferMethods(this, [ '_renderContent' ], '_render');
		super(kwArgs);
	}

	add(widget:ui.IDomWidget, position?:any, referenceNode?:Node):IHandle {
		if (referenceNode) {
			var handle:IHandle;
			referenceNode.parentNode.replaceChild(widget.getNode(), referenceNode);
			this.attach(widget);
			if (position >= 0) {
				this.get('children')[position] = widget;	
			}
			return handle; // TODO
		}
		return super.add(widget, position);
	}

	/* protected */ _contentSetter(content:Node):void {
		this._content = content;
		this._renderContent();
	}

	/* protected */ _renderContent():void {
		this.clear();
		if (this._content) {
			if (this._firstNode === this._lastNode) {
				this._firstNode.appendChild(this._content);
			}
			else {
				this._lastNode.parentNode.insertBefore(this._content, this._lastNode);
			}
			this._content = null;
		}
	}
}

export = ContentContainer;
