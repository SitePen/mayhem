import CheckBoxRenderer = require('./CheckBox');
import RadioButtonImpl = require('dijit/form/RadioButton');

class RadioButtonRenderer extends CheckBoxRenderer {}

RadioButtonRenderer.implementation({
	constructor: RadioButtonImpl
});

export = RadioButtonRenderer;
