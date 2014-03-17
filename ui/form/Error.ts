import core = require('../../interfaces');
import domConstruct = require('dojo/dom-construct');
import Element = require('../Element');
import form = require('./interfaces');

class FormError extends Element implements form.IError {
	/* protected */ _values:form.IErrorArgs;

	constructor(kwArgs?:form.IErrorArgs) {
		this._renderOptions = { elementType: 'ul' };
		super(kwArgs);
	}

	/* protected */ _errorsSetter(errors:form.ValidationError[]):void {
		this._values.errors = errors;
		this.get('firstNode').innerHTML = '';

		if (!errors) {
			return;
		}

		for (var i = 0, error:form.ValidationError; (error = errors[i]); i++) {
			var element = domConstruct.create('li', {}, this.get('firstNode'));
			element.appendChild(document.createTextNode(error.toString()));
		}
	}
}

export = FormError;
