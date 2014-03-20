import core = require('../../../interfaces');
import dom = require('../interfaces');
import domConstruct = require('dojo/dom-construct');
import DomElementRenderer = require('../../dom/_Element');
import form = require('../../form/interfaces');

class ErrorRenderer extends DomElementRenderer implements form.IErrorRenderer {
	renderList(widget:dom.form.IError):void {
		this.clear(widget);
		var firstNode = widget._firstNode,
			list = widget.get('list') || [];
		for (var i = 0, error:core.IValidationError; (error = list[i]); i++) {
			var element = domConstruct.create('li', {}, firstNode);
			element.appendChild(document.createTextNode(error.toString()));
		}
	}
}

ErrorRenderer.prototype.elementType = 'ul';

export = ErrorRenderer;
