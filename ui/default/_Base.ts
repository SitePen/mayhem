import ui = require('../interfaces');

class _BaseRenderer implements ui.IRenderer {
	className:string;
	_content:{ [key:string]: any } = <any> {};

	add(widget:ui.IContainer, item:ui.IWidget, reference?:ui.IWidget):void {
		console.debug('#add');
	}

	attachContent(widget:ui.IWidget):void {
		console.debug('#attachContent');
	}

	attachRole(widget:ui.IWidget):void {
		console.debug('#attachRole');
	}

	attachStyles(widget:ui.IWidget):void {
		console.debug('#attachStyles');
	}

	attachToWindow(widget:ui.IWidget, target:any):void {
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

	handleAction(widget:ui.IWidget, name:string, source?:any):void {
		console.debug('#handleAction');
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

	setContent(widget:ui.IWidget, value:any):void {
		console.debug('#setContent');
		this._content[widget.get('id')] = value;
	}

	updateVisibility(widget:ui.IWidget, value:boolean):void {
		console.debug('#updateVisibility');
	}
}

export = _BaseRenderer;
