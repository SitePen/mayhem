/// <amd-dependency path="../renderer!form/Textarea" />

import form = require('./interfaces');
import TextInput = require('./TextInput');

var Renderer:any = require('../renderer!form/Textarea');

class Textarea extends TextInput implements form.ITextarea {
	/* protected */ _values:form.ITextareaValues;

	get:form.ITextareaGet;
	set:form.ITextareaSet;
}

Textarea.prototype._renderer = new Renderer();

export = Textarea;
