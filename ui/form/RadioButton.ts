/// <amd-dependency path="../renderer!RadioButton" />

import CheckBox = require('./CheckBox');
import form = require('./interfaces');

var Renderer:any = require('../renderer!RadioButton');

class RadioButton extends CheckBox implements form.IRadioButtonImpl {
	/* protected */ _values:form.IRadioButtonValues;

	get:form.IRadioButtonGet;
	set:form.IRadioButtonSet;
}

RadioButton.prototype._renderer = new Renderer();

export = RadioButton;
