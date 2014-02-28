import _DijitCtor = require('dijit/MenuBarItem');
import MenuItem = require('./MenuItem');

class MenuBarItem extends MenuItem {
}

MenuBarItem.prototype._DijitCtor = _DijitCtor;

export = MenuBarItem;
