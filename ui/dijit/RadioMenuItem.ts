import CheckedMenuItem = require('./CheckedMenuItem');
import _DijitCtor = require('dijit/RadioMenuItem');

class RadioMenuItem extends CheckedMenuItem {
}

RadioMenuItem.prototype._DijitCtor = _DijitCtor;
RadioMenuItem.prototype._dijitFields = [ 'group' ];

export = RadioMenuItem;
