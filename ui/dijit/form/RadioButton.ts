import __RadioButton = require('dijit/form/RadioButton');
import Dijit = require('../Dijit');

class RadioButton extends Dijit {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__RadioButton);
		this._setDijitFields('checked', 'value');
		this._setDijitActions('onClick');
		super(kwArgs);
	}
}

export = RadioButton;
