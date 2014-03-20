/// <amd-dependency path="../renderer!form/Label" />

import form = require('./interfaces');
import View = require('../View');

var Renderer:any = require('../renderer!form/Label');

class FormLabel extends View implements form.ILabelImpl {
	/* protected */ _values:form.ILabelValues;

	get:form.ILabelGet;
	set:form.ILabelSet;
}

FormLabel.prototype._renderer = new Renderer({ elementType: 'label' });

export = FormLabel;
