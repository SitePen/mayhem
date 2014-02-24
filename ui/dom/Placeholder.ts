import domUtil = require('./util');
import FragmentWidget = require('./FragmentWidget');
import ui = require('../interfaces');

class DomPlaceholder extends FragmentWidget implements ui.IPlaceholder {
	private _content:ui.IDomWidget;

	private _contentSetter(widget:ui.IDomWidget):void {
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
