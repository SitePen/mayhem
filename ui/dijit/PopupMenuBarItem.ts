import PopupMenuItem = require('./PopupMenuItem');
import _DijitWidget = require('dijit/PopupMenuBarItem');

class PopupMenuBarItem extends PopupMenuItem {
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

PopupMenuBarItem.configure(PopupMenuItem);

export = PopupMenuBarItem;
