import dom = require('./interfaces');
import DomWidgetRenderer = require('./Widget');

class PlaceholderRenderer extends DomWidgetRenderer {
	add(widget:dom.IPlaceholdingWidget, item:dom.IWidget):void {
		item.detach();
		super.setContent(widget, item._fragment);	
	}

	remove(widget:dom.IPlaceholdingWidget, item?:dom.IWidget) {
		// Only detach content widget if it matches the provided item
		if (item === widget.get('widget')) {
			item.detach();
		}
	}
}

export = PlaceholderRenderer;
