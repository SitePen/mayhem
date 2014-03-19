/// <amd-dependency path="../renderer!ToggleButton" />

import Button = require('./Button');
import form = require('./interfaces');

var Renderer:any = require('../renderer!ToggleButton');

class ToggleButton extends Button implements form.IToggleButtonImpl {
	/* protected */ _values:form.IToggleButtonValues;

	get:form.IToggleButtonGet;
	set:form.IToggleButtonSet;
}

ToggleButton.prototype._renderer = new Renderer();

export = ToggleButton;
