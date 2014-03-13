import configure = require('../dijit/util/configure');
import DijitBase = require('../dijit/form/SimpleTextarea');
import TextInput = require('./TextInput');
import form = require('./interfaces');
import util = require('../../util');

class Textarea extends TextInput implements form.ITextarea {
	get:form.ITextareaGet;
	set:form.ITextareaSet;
}

//util.applyMixins(Textarea, [ DijitBase ]);

configure(Textarea, {
	Base: TextInput,
	mixins: [ DijitBase ]
});

export = TextInput;
