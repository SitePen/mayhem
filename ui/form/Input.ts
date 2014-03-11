import configure = require('../dijit/configure');
import Control = require('./Control');
import form = require('./interfaces');

/* abstract */ class Input extends Control implements form.IInput {
	get:form.IInputGet;
	set:form.IInputSet;
}

configure(Input, {
	Base: Control,
	rename: {
		readOnly: 'readonly'
	}
});

export = Input;
