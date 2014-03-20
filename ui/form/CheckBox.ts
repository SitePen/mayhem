/// <amd-dependency path="../renderer!form/CheckBox" />

import ToggleButton = require('./ToggleButton');
import form = require('./interfaces');

var Renderer:any = require('../renderer!form/CheckBox');

class CheckBox extends ToggleButton implements form.ICheckBoxImpl {
	/* protected */ _values:form.ICheckBoxValues;

	get:form.ICheckBoxGet;
	set:form.ICheckBoxSet;
}

CheckBox.prototype._renderer = new Renderer();

export = CheckBox;
