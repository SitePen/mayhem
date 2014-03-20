/// <amd-dependency path="../renderer!form/TextInput" />

import Input = require('./Input');
import form = require('./interfaces');

var Renderer:any = require('../renderer!form/TextInput');

class TextInput extends Input implements form.ITextInput {
	/* protected */ _values:form.ITextInputValues;

	get:form.ITextInputGet;
	set:form.ITextInputSet;
}

TextInput.prototype._renderer = new Renderer();

export = TextInput;
