/// <amd-dependency path="../renderer!Button" />

import Control = require('./Control');
import form = require('./interfaces');

var Renderer:any = require('../renderer!Button');

class Button extends Control implements form.IButtonImpl {
	/* protected */ _values:form.IButtonValues;

	get:form.IButtonGet;
	set:form.IButtonSet;
}

Button.prototype._renderer = new Renderer();

export = Button;
