import CheckBoxImpl = require('dijit/form/CheckBox');
import ControlRenderer = require('./Control');

class CheckboxRenderer extends ControlRenderer {}

CheckboxRenderer.implementation({
	constructor: CheckBoxImpl
});

export = CheckboxRenderer;
