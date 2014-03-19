import DijitCtor = require('dijit/form/TextBox');
import Input = require('./Input');
import form = require('../../form/interfaces');

class TextInput extends Input {
}

TextInput.prototype.DijitCtor = DijitCtor;

TextInput.delegate(Input, '_dijitArgs', {
	intermediateChanges: true
});

TextInput.delegate(Input, '_dijitRename', {
	maxlength: 'maxLength',
	placeholder: 'placeHolder'
});

export = TextInput;
