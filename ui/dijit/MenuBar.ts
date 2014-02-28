import Dijit = require('./Dijit');
import _DijitCtor = require('dijit/MenuBar');

class MenuBar extends Dijit {
}

MenuBar.prototype._DijitCtor = _DijitCtor;

export = MenuBar;
