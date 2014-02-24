import __ComboButton = require('dijit/form/ComboButton');
import Dijit = require('../Dijit');
import DropDownButton = require('./DropDownButton');
import util = require('../../../util');

class ComboButton extends DropDownButton {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__ComboButton);
		super(kwArgs);
	}
}

export = ComboButton;
