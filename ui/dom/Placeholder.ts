import domUtil = require('./util');
import DomWidget = require('./Widget');
import widgets = require('../interfaces');

class DomPlaceholder extends DomWidget {
	content:widgets.IWidget;
	firstNode:Comment;
	lastNode:Comment;

	placeAt(container:widgets.IContainer, position:any):IHandle {
		return container.add(this, position);
	}

	_contentSetter(widget:widgets.IDomWidget):void {
		this.content && this.content.detach();
		this.content = widget;

		if (widget) {
			var node:Node = widget.detach();
			this.lastNode.parentNode.insertBefore(node, this.lastNode);
		}
	}

	remove():void {
		this.content.detach();
		this.content = this.content.parent = null;
	}
}

export = DomPlaceholder;
