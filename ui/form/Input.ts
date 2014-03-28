import ContentView = require('../ContentView');
import form = require('./interfaces');
//import Widget = require('../Widget');

/* abstract */ class Input extends /*Widget*/ ContentView implements form.IInput {
	/* protected */ _values:form.IInputValues;

	get:form.IInputGet;
	set:form.IInputSet;
}

export = Input;
