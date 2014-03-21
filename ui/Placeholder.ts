/// <amd-dependency path="./renderer!Placeholder" />

import Container = require('./Container');
import ui = require('./interfaces');

var Renderer:any = require('./renderer!Placeholder');

class Placeholder extends Container implements ui.IPlaceholder {
	/* protected */ _values:ui.IPlaceholderValues;

	get:ui.IPlaceholderGet;
	set:ui.IPlaceholderSet;

	empty():void {
		var widget = this.get('content');
		widget && widget.detach();
	}

	/* protected */ _contentSetter(widget:ui.IWidget):void {
		var previous = this.get('content');
		previous && previous.detach();
		if (widget) {
			this._renderer.add(this, widget);
			this.attach(widget);
		}
	}
}

Placeholder.prototype._renderer = new Renderer();

export = Placeholder;
