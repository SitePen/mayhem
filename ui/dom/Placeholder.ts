import domUtil = require('./util');
import FragmentWidget = require('./FragmentWidget');
import ui = require('../interfaces');

class Placeholder extends FragmentWidget implements ui.IPlaceholder {
	private _widget:ui.IDomWidget;

	private _widgetSetter(widget:ui.IDomWidget):void {
		if (this._widget === widget) {
			return;
		}
		this._widget && this._widget.detach();
		this._widget = widget;

		if (widget) {
			var node:Node = widget.detach();
			this._lastNode.parentNode.insertBefore(node, this._lastNode);
			widget.set('attached', true);
		}
	}

	remove():void {
		if (this._widget) {
			this._widget.detach();
			this._widget = null;
		}
	}
}

export = Placeholder;
