import _DijitWidget = require('dijit/layout/ContentPane');
import _Widget = require('../_Widget');

class ContentPane extends _Widget { // _Container
	static _dijitConfig:any = {
		href: 'string',
		content: 'string',
		extractContent: 'boolean',
		parseOnLoad: 'boolean',
		parserScope: 'string',
		preventCache: 'boolean',
		preload: 'boolean',
		refreshOnShow: 'boolean',
		loadingMessage: 'string',
		errorMessage: 'string'

		// TODO: actions from dijit/_Widget
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

ContentPane.configure(_Widget);

export = ContentPane;
