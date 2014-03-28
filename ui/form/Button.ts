/// <amd-dependency path="../renderer!form/Button" />

import ContentView = require('../ContentView');
import form = require('./interfaces');
//import Widget = require('../Widget');

var Renderer:any = require('../renderer!form/Button');

class Button extends /*Widget*/ ContentView implements form.IButton {
	/* protected */ _values:form.IButtonValues;

	get:form.IButtonGet;
	set:form.IButtonSet;
}

Button.prototype._renderer = new Renderer();

export = Button;
