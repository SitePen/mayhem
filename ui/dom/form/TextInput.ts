import Input = require('./Input');
import TextBoxImpl = require('dijit/form/TextBox');

class TextInput extends Input {}

TextInput.implementation({
	constructor: TextBoxImpl,
	defaults: {
		intermediateChanges: true
	},
	nameMap: {
		maxlength: 'maxLength',
		placeholder: 'placeHolder'
	}
});

export = TextInput;
