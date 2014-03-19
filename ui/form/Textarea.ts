/// <amd-dependency path="../renderer!Textarea" />

import TextInput = require('./TextInput');
import form = require('./interfaces');

var Renderer:any = require('../renderer!Textarea');

class Textarea extends TextInput implements form.ITextareaImpl {
	/* protected */ _values:form.ITextareaValues;

	get:form.ITextareaGet;
	set:form.ITextareaSet;
}

TextInput.prototype._renderer = new Renderer();

export = TextInput;
