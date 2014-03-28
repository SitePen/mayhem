import form = require('./interfaces');
import TextViewRenderer = require('../TextView');

class LabelRenderer extends TextViewRenderer {
	render(widget:form.ILabel):void {
		super.render(widget);

		widget.observe('for', (value:string):void => {
			widget._firstNode.setAttribute('for', value);
		});
	}
}

LabelRenderer.prototype.elementType = 'label';

export = LabelRenderer;
