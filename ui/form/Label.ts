/// <amd-dependency path="../renderer!form/Label" />

import ContentView = require('../ContentView');
import form = require('./interfaces');

var Renderer:any = require('../renderer!form/Label');

class FormLabel extends ContentView implements form.ILabel {
	_for:string;

	get:form.ILabelGet;
	set:form.ILabelSet;
}

FormLabel.prototype._renderer = new Renderer();

export = FormLabel;
