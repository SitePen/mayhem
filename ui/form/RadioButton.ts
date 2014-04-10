/// <amd-dependency path="../renderer!form/RadioButton" />

import form = require('./interfaces');
import Control = require('./Control');

var Renderer:any = require('../renderer!form/RadioButton');

class RadioButton extends Control implements form.IRadioButton {
	_checked:boolean;
	_indeterminate:boolean;
	_name:string;
	_readonly:boolean;
	_value:any;

	get:form.IRadioButtonGet;
	set:form.IRadioButtonSet;
}

RadioButton.prototype._renderer = new Renderer();

export = RadioButton;
