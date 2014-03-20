/// <amd-dependency path="../renderer!form/Button" />

import Control = require('./Control');
import form = require('./interfaces');

var Renderer:any = require('../renderer!form/Button');

class Button extends Control implements form.IButton {
	/* protected */ _values:form.IButtonValues;

	get:form.IButtonGet;
	set:form.IButtonSet;
}

Button.prototype._renderer = new Renderer();

export = Button;
