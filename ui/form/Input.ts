import ContentView = require('../ContentView');
import form = require('./interfaces');
// import Widget = require('../Widget');

/* abstract */ class Input extends /*Widget*/ ContentView implements form.IInput {
	_name:string;
	_readonly:boolean;
	_value:any;

	get:form.IInputGet;
	set:form.IInputSet;
}

export = Input;
