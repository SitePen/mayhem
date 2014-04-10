/// <amd-dependency path="../renderer!form/TextArea" />

import form = require('./interfaces');
import TextField = require('./TextField');

var Renderer:any = require('../renderer!form/TextArea');

class TextArea extends TextField implements form.ITextArea {
	_columns:number;
	_rows:number;

	get:form.ITextAreaGet;
	set:form.ITextAreaSet;
}

TextArea.prototype._renderer = new Renderer();

export = TextArea;
