import _DijitWidget = require('dijit/PopupMenuItem');
import MenuItem = require('./MenuItem');

class PopupMenuItem extends MenuItem {
	static _dijitConfig:any = {
		popup: { child: '_dijit', required: true }
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

PopupMenuItem.configure(MenuItem);

export = PopupMenuItem;
