import Dijit = require('./Dijit');
import __DropDownMenu = require('dijit/DropDownMenu');

class DropDownMenu extends Dijit {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__DropDownMenu);
		super(kwArgs);
	}
}

export = DropDownMenu;
