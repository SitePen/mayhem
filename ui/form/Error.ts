/// <amd-dependency path="../renderer!form/Error" />

import core = require('../../interfaces');
import form = require('./interfaces');
import View = require('../View');

var Renderer:any = require('../renderer!form/Error');

class FormError extends View implements form.IError {
	/* protected */ _values:form.IErrorValues;

	get:form.IErrorGet;
	set:form.IErrorSet;
}

FormError.prototype._renderer = new Renderer();

export = FormError;
