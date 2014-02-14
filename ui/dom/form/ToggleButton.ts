/// <reference path="../../../dojo" />

import DijitToggleButton = require('dijit/form/ToggleButton');
import FormButton = require('./Button');

class FormToggleButton extends FormButton {
	/* protected */ _dijit:DijitToggleButton;

	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(DijitToggleButton);
		this._setDijitFields('checked');
		super(kwArgs);
	}
}

export = FormToggleButton;
