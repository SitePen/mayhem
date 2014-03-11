import configure = require('../configure');
import Dijit = require('dijit/form/ComboButton');
import form = require('./interfaces');
import DropDownButton = require('./DropDownButton');

class ComboButton extends DropDownButton {
	// TODO: interfaces
}

configure(ComboButton, {
	Base: DropDownButton,
	Dijit: Dijit
});

export = ComboButton;
