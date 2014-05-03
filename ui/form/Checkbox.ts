/// <amd-dependency path="../renderer!form/Checkbox" />

import form = require('./interfaces');
import ContentView = require('../ContentView');

var Renderer:any = require('../renderer!form/Checkbox');

class Checkbox extends /*Widget*/ ContentView implements form.ICheckbox {
	get:form.ICheckboxGet;
	set:form.ICheckboxSet;
}

Checkbox.prototype._renderer = new Renderer();

export = Checkbox;
