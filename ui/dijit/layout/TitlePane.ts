import ContentPane = require('./ContentPane');
import _DijitCtor = require('dijit/TitlePane');

class TitlePane extends ContentPane {
}

TitlePane.prototype._DijitCtor = _DijitCtor;

export = TitlePane;
