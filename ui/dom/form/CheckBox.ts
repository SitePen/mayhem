import __CheckBox = require('dijit/form/CheckBox');
import DijitWidget = require('../DijitWidget');

class FormCheckBox extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__CheckBox);
		this._setDijitFields('checked', 'value');
		this._setDijitActions('onClick');
		super(kwArgs);
	}
}

export = FormCheckBox;
