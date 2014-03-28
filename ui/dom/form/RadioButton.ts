import ControlRenderer = require('./Control');
import RadioButtonImpl = require('dijit/form/RadioButton');

class RadioButtonRenderer extends ControlRenderer {}

RadioButtonRenderer.implementation({
	constructor: RadioButtonImpl
});

export = RadioButtonRenderer;
