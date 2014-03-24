/// <amd-dependency path="../renderer!form/Button" />

import form = require('./interfaces');
import View = require('../View');
//import Widget = require('../Widget');

var Renderer:any = require('../renderer!form/Button');

class Button extends /*Widget*/ View implements form.IButton {
	/* protected */ _values:form.IButtonValues;

	get:form.IButtonGet;
	set:form.IButtonSet;
}

Button.prototype._renderer = new Renderer();

export = Button;
