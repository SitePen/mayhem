import InputRenderer = require('./Input');
import TextBoxImpl = require('dijit/form/TextBox');

class TextFieldRenderer extends InputRenderer {}

TextFieldRenderer.implementation({
	constructor: TextBoxImpl,
	defaults: {
		intermediateChanges: true
	},
	nameMap: {
		maxlength: 'maxLength',
		placeholder: 'placeHolder'
	}
});

export = TextFieldRenderer;
