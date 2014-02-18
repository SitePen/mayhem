import __DropDownMenu = require('dijit/DropDownMenu');
import DijitWidget = require('./DijitWidget');

class DropDownMenu extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__DropDownMenu);
		super(kwArgs);
	}
}

export = DropDownMenu;
