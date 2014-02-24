import DropDownMenu = require('./DropDownMenu');
import __Menu = require('dijit/Menu');

class Menu extends DropDownMenu {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__Menu);
		this._setDijitFields('refocus');
		super(kwArgs);
	}
}

export = Menu;
