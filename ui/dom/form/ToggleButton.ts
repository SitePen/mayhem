import Button = require('./Button');
import ToggleButtonImpl = require('dijit/form/ToggleButton');

class ToggleButton extends Button {}

ToggleButton.implementation({
	constructor: ToggleButtonImpl
});

export = ToggleButton;
