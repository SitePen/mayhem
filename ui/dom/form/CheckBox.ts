/// <reference path="../../../dojo" />

import DijitCheckBox = require('dijit/form/CheckBox');
import DijitWidget = require('../DijitWidget');

class FormCheckBox extends DijitWidget {
	/* protected */ _dijit:DijitCheckBox;

	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(DijitCheckBox);
		this._setDijitFields('checked', 'value');
		this._setDijitActions('onClick');
		super(kwArgs);
	}
}

export = FormCheckBox;
