/// <amd-dependency path="../renderer!Error" />

import form = require('./interfaces');
import View = require('../View');

var Renderer:any = require('../renderer!Error');

class FormError extends View implements form.IErrorImpl {
	/* protected */ _values:form.IErrorValues;

	get:form.IErrorGet;
	set:form.IErrorSet;
}

FormError.prototype._renderer = new Renderer();

export = FormError;
