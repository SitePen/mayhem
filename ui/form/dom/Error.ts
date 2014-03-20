import domConstruct = require('dojo/dom-construct');
import Element = require('../../dom/_Element');
import form = require('../../form/interfaces');

class Error extends Element {
	renderList(widget:form.IErrorImpl, list:form.ValidationError[]):void {
		this.clear(widget);
		var firstNode = widget._impl.firstNode;
		for (var i = 0, error:form.ValidationError; (error = list[i]); i++) {
			var element = domConstruct.create('li', {}, firstNode);
			element.appendChild(document.createTextNode(error.toString()));
		}
	}
}

Error.prototype.elementType = 'ul';

export = Error;
