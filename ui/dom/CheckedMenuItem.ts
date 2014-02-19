import __CheckedMenuItem = require('dijit/CheckedMenuItem');
import MenuItem = require('./MenuItem');

class CheckedMenuItem extends MenuItem {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__CheckedMenuItem);
		this._setDijitFields('checked', 'checkedChar');
		super(kwArgs);
	}
}

export = CheckedMenuItem;
