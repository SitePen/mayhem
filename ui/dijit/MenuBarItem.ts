import _DijitWidget = require('dijit/MenuBarItem');
import MenuItem = require('./MenuItem');

class MenuBarItem extends MenuItem {
	static _dijitConfig:any = {
		contextMenuForWindow: 'boolean',
		leftClickToOpen: 'boolean',
		refocus: 'boolean'
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

MenuBarItem.configure(MenuItem);

export = MenuBarItem;
