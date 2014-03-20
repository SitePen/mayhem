/// <amd-dependency path="../renderer!form/Input" />

import Control = require('./Control');
import form = require('./interfaces');

var Renderer:any = require('../renderer!form/Input');

/* abstract */ class Input extends Control implements form.IInputImpl {
	/* protected */ _values:form.IInputValues;

	get:form.IInputGet;
	set:form.IInputSet;
}

Input.prototype._renderer = new Renderer();

export = Input;
