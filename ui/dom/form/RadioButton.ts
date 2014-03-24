import CheckBox = require('./CheckBox');
import RadioButtonImpl = require('dijit/form/RadioButton');

class RadioButton extends CheckBox {}

RadioButton.implementation({
	constructor: RadioButtonImpl
});

export = RadioButton;
