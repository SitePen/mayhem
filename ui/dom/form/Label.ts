import form = require('./interfaces');
import TextRenderer = require('../Text');

class LabelRenderer extends TextRenderer {
	render(widget:form.ILabel):void {
		super.render(widget);
		this._bindAttribute(widget, 'for');
	}
}

LabelRenderer.prototype.tagName = 'label';

export = LabelRenderer;
