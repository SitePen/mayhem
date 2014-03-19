/// <amd-dependency path="../renderer!TextInput" />

import Input = require('./Input');
import form = require('./interfaces');

var Renderer:any = require('../renderer!TextInput');

class TextInput extends Input implements form.ITextInputImpl {
	/* protected */ _values:form.ITextInputValues;

	get:form.ITextInputGet;
	set:form.ITextInputSet;
}

TextInput.prototype._renderer = new Renderer();

export = TextInput;
