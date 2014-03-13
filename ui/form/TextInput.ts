import configure = require('../dijit/util/configure');
import DijitBase = require('../dijit/form/TextBox');
import Input = require('./Input');
import form = require('./interfaces');
import util = require('../../util');

class TextInput extends Input implements form.ITextInput {
	get:form.ITextInputGet;
	set:form.ITextInputSet;
}

//util.applyMixins(TextInput, [ DijitBase ]);

configure(TextInput, {
	Base: Input,
	mixins: [ DijitBase ],
	rename: {
		maxLength: 'maxlength',
		placeHolder: 'placeholder'
	}
});

export = TextInput;
