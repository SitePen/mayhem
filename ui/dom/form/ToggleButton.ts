import DijitToggleButton = require('dijit/form/ToggleButton');
import FormButton = require('./Button');

class FormToggleButton extends FormButton {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(DijitToggleButton);
		this._setDijitFields('checked');
		super(kwArgs);
	}
}

export = FormToggleButton;
