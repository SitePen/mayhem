import dom = require('./interfaces');
import _ElementRenderer = require('./_Element');
import roles = require('./roles');
import util = require('../../util');

class TextRenderer extends _ElementRenderer {
	_buttonActions:any = roles.button;
	_checkboxActions:any = roles.checkbox;
	_linkActions:any = roles.link;
	_radioActions:any = roles.radio;

	initialize(widget:dom.IText):void {
		super.initialize(widget);

		widget.observe('formattedText', (value:string) => {
			widget.setContent(value);
		});

		widget.observe('text', (value:string):void => {
			widget.setContent(util.escapeXml(value));
		});
	}

	setContent(widget:dom.IText, value:any):void {
		super.setContent(widget, value);
		// TODO: getters should retrieve these lazily (and memoize)
		// Update text properties silently w/ actual text value of our new content
		var firstNode = widget._firstNode;
		widget._formattedText = firstNode.innerHTML;
		// TODO: has-branch for old IE?
		widget._text = firstNode.textContent || firstNode.innerText;
	}
}

export = TextRenderer;
