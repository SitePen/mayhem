/// <amd-dependency path="../renderer!form/Input" />

import ContentView = require('../ContentView');
import form = require('./interfaces');
//import Widget = require('../Widget');

var Renderer:any = require('../renderer!form/Input');

/* abstract */ class Input extends /*Widget*/ ContentView implements form.IInput {
	/* protected */ _values:form.IInputValues;

	get:form.IInputGet;
	set:form.IInputSet;
}

Input.prototype._renderer = new Renderer();

export = Input;
