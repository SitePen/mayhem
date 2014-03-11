import Button = require('./Button');
import configure = require('../configure');
import Dijit = require('dijit/form/ToggleButton');
import form = require('./interfaces');

class ToggleButton extends Button implements form.IToggleButton {
	get:form.IToggleButtonGet;
	set:form.IToggleButtonSet;
}

configure(ToggleButton, {
	Base: Button,
	Dijit: Dijit,
	schema: {
		checked: Boolean
	}
});

export = ToggleButton;
