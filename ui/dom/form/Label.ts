import _Element = require('../../dom/_Element');
import form = require('./interfaces');
import util = require('../../../util');

class Label extends _Element {
	render(widget:form.ILabel):void {
		super.render(widget);
		widget.observe('for', (value:string):void => {
			widget._firstNode.setAttribute('for', value);
		});

		widget.observe('text', (value:string):void => {
			// TODO: set up observer on formattedText to set body, wire up content setter
			// widget.set('formattedText', util.escapeXml(value));
			var body = widget._values.formattedText = util.escapeXml(value);
			this.setBody(widget, body);
		});

		widget.observe('content', ():void => {
			var firstNode = widget._firstNode;
			// TODO: has-branch for old IE?
			widget._values.text = firstNode.textContent || firstNode.innerText;
		});
	}
}

Label.prototype.elementType = 'label';

export = Label;
