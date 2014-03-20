/// <amd-dependency path="../renderer!form/RadioButton" />

import form = require('./interfaces');
import CheckBox = require('./CheckBox');

var Renderer:any = require('../renderer!form/RadioButton');

class RadioButton extends CheckBox implements form.IRadioButton {
	/* protected */ _values:form.IRadioButtonValues;

	get:form.IRadioButtonGet;
	set:form.IRadioButtonSet;
}

RadioButton.prototype._renderer = new Renderer();

export = RadioButton;
