import dom = require('./interfaces');
import DomElementRenderer = require('./_Element');
import util = require('../../util');

class TextViewRenderer extends DomElementRenderer {
	render(widget:dom.ITextView):void {
		super.render(widget);

		widget.observe('formattedText', (value:string):void => {
			this.setContent(widget, value);
		});

		widget.observe('text', (value:string):void => {
			this.setContent(widget, util.escapeXml(value));
		});
	}

	setContent(widget:dom.ITextView, value:any):void {
		super.setContent(widget, value);
		// Update text properties silently w/ actual text value of our new content
		var firstNode = widget._firstNode;
		widget._formattedText = firstNode.innerHTML;
		// TODO: has-branch for old IE?
		widget._text = firstNode.textContent || firstNode.innerText;
	}
}

export = TextViewRenderer;
