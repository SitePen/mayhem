import _DijitCtor = require('dijit/CheckedMenuItem');
import MenuItem = require('./MenuItem');

class CheckedMenuItem extends MenuItem {
}

CheckedMenuItem.prototype._DijitCtor = _DijitCtor;
CheckedMenuItem.prototype._dijitFields = [ 'checked', 'checkedChar' ];

export = CheckedMenuItem;
