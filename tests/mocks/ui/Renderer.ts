import ui = require('../../../ui/interfaces');

class MockRenderer implements ui.IRenderer {
	callCounts:any = {};
	className:string;
	_content:any;
	_addArgs:any;

	updateCallCount(name:string) {
		if (!(name in this.callCounts)) {
			this.callCounts[name] = 0;
		}
		this.callCounts[name]++;
	}

	add(widget:ui.IContainer, item:ui.IWidget, position:any):void {
		this.updateCallCount('add');
		this._addArgs = arguments;
	}

	attachContent(widget:ui.IWidget):void {
		this.updateCallCount('attachContent');
	}

	attachStyles(widget:ui.IWidget):void {
		this.updateCallCount('attachStyles');
	}

	attachToWindow(widget:ui.IWidget, target:any):void {
		this.updateCallCount('attachToWidget');
	}

	clear(widget:ui.IWidget):void {
		this.updateCallCount('clear');
	}

	destroy(widget:ui.IWidget):void {
		this.updateCallCount('destroy');
	}

	detach(widget:ui.IWidget):void {
		this.updateCallCount('detach');
	}

	detachContent(widget:ui.IWidget):void {
		this.updateCallCount('detachContent');
	}

	detachStyles(widget:ui.IWidget):void {
		this.updateCallCount('detachContent');
	}

	initialize(widget:ui.IWidget):void {
		this.updateCallCount('initialize');
	}

	remove(widget:ui.IContainer, item:ui.IWidget):void {
		this.updateCallCount('remove');
	}

	render(widget:ui.IWidget):void {
		this.updateCallCount('render');
	}

	setContent(widget:ui.IWidget, content:Node):void {
		this.updateCallCount('setContent');
		this._content = content;
	}
}

MockRenderer.prototype.className = '';

export = MockRenderer;
