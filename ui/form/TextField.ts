/// <amd-dependency path="../renderer!form/TextField" />

import Input = require('./Input');
import form = require('./interfaces');

var Renderer:any = require('../renderer!form/TextField');

class TextField extends Input implements form.ITextField {
	/* protected */ _values:form.ITextFieldValues;

	get:form.ITextFieldGet;
	set:form.ITextFieldSet;
}

TextField.prototype._renderer = new Renderer();

export = TextField;
