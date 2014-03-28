import ControlRenderer = require('./Control');
import ToggleButtonImpl = require('dijit/form/ToggleButton');

class ToggleButtonRenderer extends ControlRenderer {}

ToggleButtonRenderer.implementation({
	constructor: ToggleButtonImpl
});

export = ToggleButtonRenderer;
