import dom = require('./interfaces');
import DomElementRenderer = require('./_Element');
import util = require('../../util');

class DialogRenderer extends DomElementRenderer {
	initialize(widget:dom.IDialog):void {
		super.initialize(widget);

		widget.observe('closable', (value:boolean) => {
			// TODO: add or remove close button
		});
	}
	render(widget:dom.IDialog):void {
		super.render(widget);

		widget._firstNode.setAttribute('role', 'dialog');
	}
}

export = DialogRenderer;
