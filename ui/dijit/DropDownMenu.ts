import Dijit = require('./Dijit');
import _DijitCtor = require('dijit/DropDownMenu');

class DropDownMenu extends Dijit {
}

DropDownMenu.prototype._DijitCtor = _DijitCtor;

export = DropDownMenu;
