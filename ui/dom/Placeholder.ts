import domUtil = require('./util');
import MultiNodeWidget = require('./MultiNodeWidget');
import widgets = require('../interfaces');

class DomPlaceholder extends MultiNodeWidget {
	// for now this has to be an IDomWidget because detach returns Node instead of void
	content:widgets.IWidget;

	_contentSetter(widget:widgets.IDomWidget):void {
		// if ('_evaluateConditions' in this) {
		// 	debugger
		// }
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
