import configure = require('../configure');
import layout = require('./interfaces');
import Dijit = require('dijit/layout/ContentPane');
import _Widget = require('../_Widget');

class ContentPane extends _Widget implements layout.IContentPane {
	get:layout.IContentPaneGet;
	set:layout.IContentPaneSet;
}

configure(ContentPane, {
	Base: _Widget,
	Dijit: Dijit,
	schema: {
		href: String,
		content: String,
		extractContent: Boolean,
		parseOnLoad: Boolean,
		parserScope: String,
		preventCache: Boolean,
		preload: Boolean,
		refreshOnShow: Boolean,
		loadingMessage: String,
		errorMessage: String

		// TODO: actions from dijit/_Widget
	}
});

export = ContentPane;
