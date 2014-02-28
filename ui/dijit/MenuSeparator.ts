import Dijit = require('./Dijit');
import _DijitCtor = require('dijit/MenuSeparator');

class MenuSeparator extends Dijit {
}

MenuSeparator.prototype._DijitCtor = _DijitCtor;

export = MenuSeparator;
