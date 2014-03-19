import DijitCtor = require('dijit/form/SimpleTextarea');
import TextInput = require('./TextInput');

class Textarea extends TextInput {
}

Textarea.prototype.DijitCtor = DijitCtor;

export = Textarea;
