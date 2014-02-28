import _DijitWidget = require('dijit/CheckedMenuItem');
import MenuItem = require('./MenuItem');

class CheckedMenuItem extends MenuItem {
	static _dijitConfig:any = {
		checked: 'boolean',
		checkedChar: 'string'
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

CheckedMenuItem.configure(MenuItem);

export = CheckedMenuItem;
