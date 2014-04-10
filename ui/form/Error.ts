/// <amd-dependency path="../renderer!form/Error" />

import ContentView = require('../ContentView');
import core = require('../../interfaces');
import form = require('./interfaces');

var Renderer:any = require('../renderer!form/Error');

class FormError extends ContentView implements form.IError {
	_list:core.IValidationError[];

	get:form.IErrorGet;
	set:form.IErrorSet;
}

FormError.prototype._renderer = new Renderer();

export = FormError;
