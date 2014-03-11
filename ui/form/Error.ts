import core = require('../../interfaces');
import domConstruct = require('dojo/dom-construct');
import Element = require('../Element');
import form = require('./interfaces');

class FormError extends Element implements form.IError {
	private _errors:form.ValidationError[];
	private _errorsProxty:core.IProxty<form.ValidationError[]>;

	// Please shut up, typescript
	private _firstNode:HTMLUListElement;

	constructor(kwArgs?:Object) {
		//util.deferMethods(this, [ '_errorsSetter' ], '_render');
		this._renderOptions = { elementType: 'ul' };
		super(kwArgs);
	}

	destroy():void {
		this._errorsProxty && this._errorsProxty.destroy();
		this._errorsProxty = null;

		super.destroy();
	}

	/* protected */ _errorsSetter(errors:form.ValidationError[]):void {
		this._errors = errors;
		this._firstNode.innerHTML = '';

		if (!errors) {
			return;
		}

		for (var i = 0, error:form.ValidationError; (error = errors[i]); i++) {
			var element = domConstruct.create('li', {}, this._firstNode);
			element.appendChild(document.createTextNode(error.toString()));
		}
	}
}

export = FormError;
