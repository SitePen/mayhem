import CheckBoxImpl = require('dijit/form/CheckBox');
import ToggleButton = require('./ToggleButton');

class CheckBox extends ToggleButton {}

CheckBox.implementation({
	constructor: CheckBoxImpl
});

export = CheckBox;
