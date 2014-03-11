import Button = require('./Button');
import configure = require('../dijit/configure');
import DijitBase = require('../dijit/form/ToggleButton');
import form = require('./interfaces');
import util = require('../../util');

class ToggleButton extends Button implements form.IToggleButton {
	get:form.IToggleButtonGet;
	set:form.IToggleButtonSet;
}

util.applyMixins(ToggleButton, [ DijitBase ]);

configure(ToggleButton, {
	Base: Button,
	mixins: [ DijitBase ]
});

export = ToggleButton;
