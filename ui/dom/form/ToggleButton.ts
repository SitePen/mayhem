import FormButton = require('./Button');
import __ToggleButton = require('dijit/form/ToggleButton');

class FormToggleButton extends FormButton {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__ToggleButton);
		this._setDijitFields('checked');
		super(kwArgs);
	}
}

export = FormToggleButton;
