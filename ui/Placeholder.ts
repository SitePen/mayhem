/// <amd-dependency path="./renderer!Placeholder" />

import Container = require('./Container');
import ui = require('./interfaces');

var Renderer:any = require('./renderer!Placeholder');

class Placeholder extends Container implements ui.IPlaceholder {
	/* protected */ _values:ui.IPlaceholderValues;

	get:ui.IPlaceholderGet;
	set:ui.IPlaceholderSet;

	empty():void {
		var widget = this.get('widget');
		widget && widget.detach();
	}

	/* protected */ _initialize():void {
		this.observe('widget', (widget:ui.IWidget, previous:ui.IWidget):void => {
			previous && previous.detach();
			this._placeWidget();
		});
	}

	/* protected */ _placeWidget():void {
		var widget = this.get('widget');
		if (widget) {
			this._renderer.add(this, widget);
			this.attach(widget);
		}
	}
}

Placeholder.prototype._renderer = new Renderer();

export = Placeholder;
