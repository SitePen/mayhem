import _DijitCtor = require('dijit/Menu');
import DropDownMenu = require('./DropDownMenu');

class Menu extends DropDownMenu {
}

Menu.prototype._DijitCtor = _DijitCtor;
Menu.prototype._dijitFields = [ 'refocus' ];

export = Menu;
