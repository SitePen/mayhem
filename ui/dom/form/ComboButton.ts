import __ComboButton = require('dijit/form/ComboButton');
import DomContainer = require('../Container');
import DijitWidget = require('../DijitWidget');
import FormDropDownButton = require('./DropDownButton');
import util = require('../../../util');
import widgets = require('../../interfaces');

class FormComboButton extends FormDropDownButton {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__ComboButton);
		super(kwArgs);
	}
}

export = FormComboButton;
