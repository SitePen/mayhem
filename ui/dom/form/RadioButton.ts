import RadioButton = require('dijit/form/RadioButton');
import DijitWidget = require('../DijitWidget');
import util = require('../../../util');

class FormRadioButton extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(RadioButton);
		this._setDijitFields('checked', 'value');
		this._setDijitActions('onClick');
		super(kwArgs);
	}
}

export = FormRadioButton;
