import Mediated = require('./Mediated');
import ui = require('./interfaces');

class Placeholder extends Mediated implements ui.IPlaceholder {
	private _widget:ui.IWidget;

	get:ui.IPlaceholderGet;
	set:ui.IPlaceholderSet;

	empty():void {
		if (this._widget) {
			this._widget.detach();
			this._widget = null;
		}
	}

	private _widgetSetter(widget:ui.IWidget):void {
		if (this._widget === widget) {
			return;
		}
		this._widget && this._widget.detach();
		this._widget = widget;

		if (widget) {
			widget.detach();
			this._renderer.setBody(this, widget.get('fragment'));
			widget.set('attached', true);
		}
	}
}

export = Placeholder;
