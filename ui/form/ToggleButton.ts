/// <amd-dependency path="../renderer!form/ToggleButton" />

import Button = require('./Button');
import form = require('./interfaces');

var Renderer:any = require('../renderer!form/ToggleButton');

class ToggleButton extends Button implements form.IToggleButton {
	_checked:boolean;
	_indeterminate:boolean;

	get:form.IToggleButtonGet;
	set:form.IToggleButtonSet;
}

ToggleButton.prototype._renderer = new Renderer();

export = ToggleButton;
