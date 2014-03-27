import dom = require('../interfaces');
import DomElementRenderer = require('../../dom/_Element');
import form = require('./interfaces');
import util = require('../../../util');

class LabelRenderer extends DomElementRenderer {
	render(widget:form.ILabel):void {
		super.render(widget);

		widget.observe('for', (value:string):void => {
			widget._firstNode.setAttribute('for', value);
		});

		widget.observe('formattedText', (value:string) => {
			this.setContent(widget, value);
		});

		widget.observe('text', (value:string):void => {
			this.setContent(widget, util.escapeXml(value));
		});
	}

	setContent(widget:form.ILabel, value:any):void {
		super.setContent(widget, value);
		// Update text properties silently w/ actual text value of our new content
		var firstNode = widget._firstNode;
		widget._values.formattedText = firstNode.innerHTML;
		// TODO: has-branch for old IE?
		widget._values.text = firstNode.textContent || firstNode.innerText;
	}
}

LabelRenderer.prototype.elementType = 'label';

export = LabelRenderer;
