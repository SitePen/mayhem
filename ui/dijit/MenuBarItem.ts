import __MenuBarItem = require('dijit/MenuBarItem');
import MenuItem = require('./MenuItem');

class MenuBarItem extends MenuItem {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__MenuBarItem);
		super(kwArgs);
	}
}

export = MenuBarItem;
