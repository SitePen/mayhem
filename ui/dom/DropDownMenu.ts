import DijitWidget = require('./DijitWidget');
import __DropDownMenu = require('dijit/DropDownMenu');

class DropDownMenu extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__DropDownMenu);
		super(kwArgs);
	}
}

export = DropDownMenu;
