import configure = require('./util/configure');
import ContentPane = require('./layout/ContentPane');
import dijit = require('./interfaces');
import Dijit = require('dijit/TitlePane');

class TitlePane extends ContentPane implements dijit.ITitlePane {
	get:dijit.ITitlePaneGet;
	set:dijit.ITitlePaneSet;
}

configure(TitlePane, {
	Base: ContentPane,
	Dijit: Dijit,
	schema: {
		// TODO
	}
});

export = TitlePane;
