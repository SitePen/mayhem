/// <amd-dependency path="../renderer!form/CheckBox" />

import form = require('./interfaces');
import ToggleButton = require('./ToggleButton');

var Renderer:any = require('../renderer!form/CheckBox');

class CheckBox extends ToggleButton implements form.ICheckBox {
	/* protected */ _values:form.ICheckBoxValues;

	get:form.ICheckBoxGet;
	set:form.ICheckBoxSet;
}

CheckBox.prototype._renderer = new Renderer();

export = CheckBox;
