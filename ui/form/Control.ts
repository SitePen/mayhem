import ContentView = require('../ContentView');
import form = require('./interfaces');
//import Widget = require('../Widget');

/* abstract */ class Control extends /*Widget*/ ContentView implements form.IControl {
	/* protected */ _values:form.IControlValues;

	get:form.IControlGet;
	set:form.IControlSet;
}

export = Control;
