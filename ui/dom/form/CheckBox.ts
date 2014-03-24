import CheckBoxImpl = require('dijit/form/CheckBox');
import ToggleButtonRenderer = require('./ToggleButton');

class CheckBoxRenderer extends ToggleButtonRenderer {}

CheckBoxRenderer.implementation({
	constructor: CheckBoxImpl
});

export = CheckBoxRenderer;
