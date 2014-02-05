import domUtil = require('./util');
import MultiNodeWidget = require('./MultiNodeWidget');
import widgets = require('../interfaces');

class DomPlaceholder extends MultiNodeWidget {
	private _content:widgets.IDomWidget;

	private _contentSetter(widget:widgets.IDomWidget):void {
		if (this._content === widget) {
			return;
		}
		this._content && this._content.detach();
		this._content = widget;

		if (widget) {
			var node:Node = widget.detach();
			this._lastNode.parentNode.insertBefore(node, this._lastNode);
		}
	}

	remove():void {
		if (this._content) {
			this._content.detach();
			this._content = null;
		}
	}
}

export = DomPlaceholder;
