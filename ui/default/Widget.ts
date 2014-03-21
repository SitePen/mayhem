import ui = require('../interfaces');

class DefaultWidgetRenderer implements ui.IRenderer {
	add(widget:ui.IContainer, item:ui.IWidget, referenceItem?:ui.IWidget):void {
		console.debug('#add');
	}

	attachToWindow(widget:ui.IWidget, target:Node):void {
		console.debug('#attachToWindow');
	}

	clear(widget:ui.IWidget):void {
		console.debug('#clear');
	}

	destroy(widget:ui.IWidget):void {
		console.debug('#destroy');
	}

	detach(widget:ui.IWidget):void {
		console.debug('#detach');
	}

	initialize(widget:ui.IWidget):void {
		console.debug('#initialize');
	}

	remove(widget:ui.IContainer, item:ui.IWidget):void {
		console.debug('#remove');
	}

	render(widget:ui.IWidget):void {
		console.debug('#render');
	}

	setContent(widget:ui.IWidget, value?:any /* string | Node */):void {
		console.debug('#setContent');
	}
}

export = DefaultWidgetRenderer;
