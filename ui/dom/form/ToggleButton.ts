import ButtonRenderer = require('./Button');
import ToggleButtonImpl = require('dijit/form/ToggleButton');

class ToggleButtonRenderer extends ButtonRenderer {}

ToggleButtonRenderer.implementation({
	constructor: ToggleButtonImpl
});

export = ToggleButtonRenderer;
