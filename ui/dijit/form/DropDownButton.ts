import Button = require('./Button');
import configure = require('../configure');
import Dijit = require('dijit/form/DropDownButton');
import form = require('./interfaces');

class DropDownButton extends Button {
	// TODO: interfaces
}

configure(DropDownButton, {
	Base: Button,
	Dijit: Dijit,
	schema: {
		dropDown: { child: '_dijit', required: true }
	}
});

export = DropDownButton;
