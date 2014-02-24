import __CheckBox = require('dijit/form/CheckBox');
import Dijit = require('../Dijit');

class CheckBox extends Dijit {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__CheckBox);
		this._setDijitFields('checked', 'value');
		this._setDijitActions('onClick');
		super(kwArgs);
	}
}

export = CheckBox;
