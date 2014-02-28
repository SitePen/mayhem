import ContentPane = require('./layout/ContentPane');
import _DijitWidget = require('dijit/TitlePane');

class TitlePane extends ContentPane {
	// TODO: _dijitConfig
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

TitlePane.configure(ContentPane);

export = TitlePane;
