import dom = require('../interfaces');
import DomElementRenderer = require('../../dom/_Element');
import util = require('../../../util');

class LabelRenderer extends DomElementRenderer {
	render(widget:dom.form.ILabel):void {
		super.render(widget);
		widget.observe('for', (value:string):void => {
			widget._firstNode.setAttribute('for', value);
		});

		widget.observe('text', (value:string):void => {
			// TODO: set up observer on formattedText to set body, wire up content setter
			// widget.set('formattedText', util.escapeXml(value));
			var content = widget._values.formattedText = util.escapeXml(value);
			this.setContent(widget, content);
		});

		widget.observe('content', ():void => {
			var firstNode = widget._firstNode;
			// TODO: has-branch for old IE?
			widget._values.text = firstNode.textContent || firstNode.innerText;
		});
	}
}

LabelRenderer.prototype.elementType = 'label';

export = LabelRenderer;
