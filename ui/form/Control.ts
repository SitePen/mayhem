import ContentView = require('../ContentView');
import form = require('./interfaces');
// import Widget = require('../Widget');

/* abstract */ class Control extends /*Widget*/ ContentView implements form.IControl {
	_disabled:boolean;

	get:form.IControlGet;
	set:form.IControlSet;
}

export = Control;
