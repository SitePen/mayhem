import dom = require('./interfaces');
import domUtil = require('../../ui/dom/util');
import DomRenderer = require('./Renderer');
import ui = require('../interfaces');

class ElementRenderer extends DomRenderer {
	destroy(widget:dom.IWidget):void {
		widget.set({
			firstNode: null,
			lastNode: null
		});
	}

	render(widget:dom.IWidget):void {
		// TODO: parameterize the node type
		var node = document.createElement('div');
		widget.set({
			firstNode: node,
			lastNode: node
		});
	}
}

export = ElementRenderer;
