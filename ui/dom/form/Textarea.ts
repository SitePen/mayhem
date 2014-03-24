import SimpleTextAreaImpl = require('dijit/form/SimpleTextarea');
import TextInput = require('./TextInput');

class Textarea extends TextInput {}

Textarea.implementation({
	constructor: SimpleTextAreaImpl
});

export = Textarea;
