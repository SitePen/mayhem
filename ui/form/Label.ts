/// <amd-dependency path="../renderer!Label" />

import form = require('./interfaces');
import View = require('../View');

var Renderer:any = require('../renderer!Label');

class FormLabel extends View implements form.ILabelImpl {
	/* protected */ _values:form.ILabelValues;

	get:form.ILabelGet;
	set:form.ILabelSet;
}

FormLabel.prototype._renderer = new Renderer({ elementType: 'label' });

export = FormLabel;
