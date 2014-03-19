import domConstruct = require('dojo/dom-construct');
import Element = require('../../dom/Element');
import form = require('../../form/interfaces');

class Error extends Element {
	render(widget:form.IErrorImpl):void {
		super.render(widget);
		widget.observe('errors', (value:form.ValidationError[]) => {
			this.clear(widget);
			if (!value) {
				return;
			}
			var firstNode = widget._impl.firstNode;
			for (var i = 0, error:form.ValidationError; (error = value[i]); i++) {
				var element = domConstruct.create('li', {}, firstNode);
				element.appendChild(document.createTextNode(error.toString()));
			}
		});
	}
}

Error.prototype.elementType = 'ul';

export = Error;
