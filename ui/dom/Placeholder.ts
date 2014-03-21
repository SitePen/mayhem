import dom = require('./interfaces');
import DomWidgetRenderer = require('./Widget');

class PlaceholderRenderer extends DomWidgetRenderer {
	add(widget:dom.IPlaceholdingWidget, contentWidget:dom.IWidget):void {
		contentWidget.detach();
		super.setBody(widget, contentWidget._fragment);	
	}

	remove(widget:dom.IPlaceholdingWidget, item?:dom.IWidget) {
		item === widget.get('content') && item.detach();
	}
}

export = PlaceholderRenderer;
