import configure = require('../dijit/util/configure');
import Control = require('./Control');
import DijitBase = require('../dijit/form/Button');
import form = require('./interfaces');
import util = require('../../util');

class Button extends Control implements form.IButton {
	get:form.IButtonGet;
	set:form.IButtonSet;
}

util.applyMixins(Button, [ DijitBase ]);

configure(Button, {
	Base: Control,
	mixins: [ DijitBase ]
});

export = Button;
