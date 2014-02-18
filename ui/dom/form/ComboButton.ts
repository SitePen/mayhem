/// <reference path="../../../dojo" />

import DomContainer = require('../Container');
import DijitComboButton = require('dijit/form/ComboButton');
import DijitWidget = require('../DijitWidget');
import FormDropDownButton = require('./DropDownButton');
import util = require('../../../util');
import widgets = require('../../interfaces');

class FormComboButton extends FormDropDownButton {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(DijitComboButton);
		super(kwArgs);
	}
}

export = FormComboButton;
