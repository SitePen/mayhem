import Dijit = require('./Dijit');
import _DijitCtor = require('dijit/MenuItem');

class MenuItem extends Dijit {
}

MenuItem.prototype._DijitCtor = _DijitCtor;
MenuItem.prototype._dijitActions = [ 'onClick' ];

export = MenuItem;
