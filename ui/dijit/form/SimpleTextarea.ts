import configure = require('../configure');
import Dijit = require('dijit/form/SimpleTextarea');
import form = require('./interfaces');
import TextBox = require('./TextBox');

class SimpleTextarea extends TextBox implements form.ITextarea {
	get:form.ITextareaGet;
	set:form.ITextareaSet;
}

configure(SimpleTextarea, {
	Base: TextBox,
	Dijit: Dijit,
	schema: {
		cols: Number,
		rows: Number
	}
});

export = SimpleTextarea;
