import ui = require('../interfaces');

class DefaultWidgetRenderer implements ui.IRenderer {
	_content:{ [key:string]: any } = <any> {};

	add(widget:ui.IContainer, item:ui.IWidget, referenceItem?:ui.IWidget):void {
		console.debug('#add');
	}

	attachContent(widget:ui.IWidget):void {
		console.debug('#attachContent');
	}

	attachStyles(widget:ui.IWidget):void {
		console.debug('#attachStyles');
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

	detachContent(widget:ui.IWidget):void {
		console.debug('#detachContent');
	}

	detachStyles(widget:ui.IWidget):void {
		console.debug('#detachStyles');
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
		this._content[widget.get('id')] = value;
	}
}

export = DefaultWidgetRenderer;
