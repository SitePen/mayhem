/// <amd-dependency path="../renderer!Input" />

import Control = require('./Control');
import form = require('./interfaces');

var Renderer:any = require('../renderer!Input');

/* abstract */ class Input extends Control implements form.IInputImpl {
	/* protected */ _values:form.IInputValues;

	get:form.IInputGet;
	set:form.IInputSet;
}

Input.prototype._renderer = new Renderer();

export = Input;
