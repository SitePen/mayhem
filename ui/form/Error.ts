/// <amd-dependency path="../renderer!form/Error" />

import core = require('../../interfaces');
import form = require('./interfaces');
import List = require('../List');

var Renderer:any = require('../renderer!form/Error');

class FormError extends List implements form.IError {
	get:form.IErrorGet;
	set:form.IErrorSet;
}

FormError.prototype._renderer = new Renderer();

export = FormError;
