import CheckBox = require('./CheckBox');
import configure = require('../util/configure');
import form = require('./interfaces');
import Dijit = require('dijit/form/RadioButton');

class RadioButton extends CheckBox implements form.IRadioButton {
	get:form.IRadioButtonGet;
	set:form.IRadioButtonSet;
}

configure(RadioButton, {
	Base: CheckBox,
	Dijit: Dijit
});

export = RadioButton;
