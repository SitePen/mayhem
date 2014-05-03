/// <amd-dependency path="../renderer!form/RadioButton" />

import form = require('./interfaces');
import ContentView = require('../ContentView');

var Renderer:any = require('../renderer!form/RadioButton');

class RadioButton extends /* Widget */ ContentView implements form.IRadioButton {
	get:form.IRadioButtonGet;
	set:form.IRadioButtonSet;
}

RadioButton.prototype._renderer = new Renderer();

export = RadioButton;
