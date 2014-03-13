import configure = require('../util/configure');
import Dijit = require('dijit/form/TextBox');
import form = require('./interfaces');
import _FormValueWidget = require('./_FormValueWidget');
import _TextBoxMixin = require('./_TextBoxMixin');

class TextBox extends _FormValueWidget implements form.ITextBox {
	get:form.ITextBoxGet;
	set:form.ITextBoxSet;
}

configure(TextBox, {
	Base: _FormValueWidget,
	Dijit: Dijit,
	mixins: [ _TextBoxMixin ],
	schema: {
		intermediateChanges: { type: Boolean, value: true }
	}
});

export = TextBox;
