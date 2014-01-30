import domUtil = require('./util');
import MultiNodeWidget = require('./MultiNodeWidget');
import widgets = require('../interfaces');

class DomPlaceholder extends MultiNodeWidget {
	content:widgets.IDomWidget;

	private _contentSetter(widget:widgets.IDomWidget):void {

		this.content && this.content.detach();
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
