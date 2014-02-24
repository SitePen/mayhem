import Button = require('./Button');
import __ToggleButton = require('dijit/form/ToggleButton');

class ToggleButton extends Button {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__ToggleButton);
		this._setDijitFields('checked');
		super(kwArgs);
	}
}

export = ToggleButton;
