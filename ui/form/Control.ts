/// <amd-dependency path="../renderer!Control" />

import form = require('./interfaces');
import Widget = require('../Widget');

var Renderer:any = require('../renderer!Control');

/* abstract */ class Control extends Widget implements form.IControlImpl {
	/* protected */ _values:form.IControlValues;

	get:form.IControlGet;
	set:form.IControlSet;
}

Control.prototype._renderer = new Renderer();

export = Control;
