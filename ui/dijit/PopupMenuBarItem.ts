import PopupMenuItem = require('./PopupMenuItem');
import _DijitCtor = require('dijit/PopupMenuBarItem');

class PopupMenuBarItem extends PopupMenuItem {
}

PopupMenuBarItem.prototype._DijitCtor = _DijitCtor;

export = PopupMenuBarItem;
