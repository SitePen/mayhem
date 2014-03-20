/// <amd-dependency path="../renderer!form/Control" />

import form = require('./interfaces');
import View = require('../View');
//import Widget = require('../Widget');

var Renderer:any = require('../renderer!form/Control');

/* abstract */ class Control extends /*Widget*/ View implements form.IControl {
	/* protected */ _values:form.IControlValues;

	get:form.IControlGet;
	set:form.IControlSet;
}

Control.prototype._renderer = new Renderer();

export = Control;
