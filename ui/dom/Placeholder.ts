import domUtil = require('./util');
import MultiNodeWidget = require('./MultiNodeWidget');
import widgets = require('../interfaces');

class DomPlaceholder extends MultiNodeWidget {
	content:widgets.IDomWidget;

	_contentSetter(widget:widgets.IDomWidget):void {

		this.content && this.content.detach();
		//this.content && domUtil.getRange(this.content.firstNode, this.content.lastNode).extractContents();
		if (this.content) this.content._fragment = null;
		this.content = widget;

		if (widget) {
			var node:Node = widget.detach();
			this.lastNode.parentNode.insertBefore(node, this.lastNode);
		}
	}

	remove():void {
		this.content.detach();
		this.content = null;
	}
}

export = DomPlaceholder;
