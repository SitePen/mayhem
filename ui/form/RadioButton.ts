/// <amd-dependency path="../renderer!form/RadioButton" />

import CheckBox = require('./CheckBox');
import form = require('./interfaces');

var Renderer:any = require('../renderer!form/RadioButton');

class RadioButton extends CheckBox implements form.IRadioButtonImpl {
	/* protected */ _values:form.IRadioButtonValues;

	get:form.IRadioButtonGet;
	set:form.IRadioButtonSet;
}

RadioButton.prototype._renderer = new Renderer();

export = RadioButton;
