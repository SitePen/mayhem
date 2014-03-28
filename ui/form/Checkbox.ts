/// <amd-dependency path="../renderer!form/Checkbox" />

import form = require('./interfaces');
import Control = require('./Control');

var Renderer:any = require('../renderer!form/Checkbox');

class Checkbox extends Control implements form.ICheckbox {
	/* protected */ _values:form.ICheckboxValues;

	get:form.ICheckboxGet;
	set:form.ICheckboxSet;
}

Checkbox.prototype._renderer = new Renderer();

export = Checkbox;
