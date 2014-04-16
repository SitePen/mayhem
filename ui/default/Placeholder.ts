import _FragmentRenderer = require('./_Fragment');
import ui = require('../interfaces');

class PlaceholderRenderer extends _FragmentRenderer {
	add(widget:ui.IPlaceholder, item:ui.IWidget):void {
		item.detach();
		super.setContent(widget, item);	
	}

	remove(widget:ui.IPlaceholder, item?:ui.IWidget) {
		// Only detach content widget if it matches the provided item
		if (item === widget.get('widget')) {
			item.detach();
		}
	}
}

export = PlaceholderRenderer;
