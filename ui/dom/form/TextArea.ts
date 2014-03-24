import SimpleTextareaImpl = require('dijit/form/SimpleTextarea');
import TextFieldRenderer = require('./TextField');

class TextAreaRenderer extends TextFieldRenderer {}

TextAreaRenderer.implementation({
	constructor: SimpleTextareaImpl
});

export = TextAreaRenderer;
