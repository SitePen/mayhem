/// <amd-dependency path="../renderer!form/Checkbox" />

import form = require('./interfaces');
import Control = require('./Control');

var Renderer:any = require('../renderer!form/Checkbox');

class Checkbox extends Control implements form.ICheckbox {
	_checked:boolean;
	_indeterminate:boolean;
	_name:string;
	_readonly:boolean;
	_value:any;

	get:form.ICheckboxGet;
	set:form.ICheckboxSet;
}

Checkbox.prototype._renderer = new Renderer();

export = Checkbox;
