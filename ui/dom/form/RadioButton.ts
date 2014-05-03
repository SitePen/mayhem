import DijitRenderer = require('../_Dijit');
import RadioButtonImpl = require('dijit/form/RadioButton');

class RadioButtonRenderer extends DijitRenderer {}

RadioButtonRenderer.implementation({
	constructor: RadioButtonImpl
});

export = RadioButtonRenderer;
