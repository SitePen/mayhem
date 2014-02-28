import Dijit = require('../Dijit');
import _DijitCtor = require('dijit/layout/ContentPane');

class ContentPane extends Dijit {
}

ContentPane.prototype._DijitCtor = _DijitCtor;
ContentPane.prototype._dijitFields = [ 'title', 'selected', 'closable' ];

export = ContentPane;
