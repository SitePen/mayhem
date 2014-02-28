import _DijitWidget = require('dijit/layout/BorderContainer');
import LayoutContainer = require('./LayoutContainer');

class BorderContainer extends LayoutContainer {
	static _childDijitConfig:any = {
		splitter: 'boolean',
		minSize: 'number',
		maxSize: 'number'
	}
	static _dijitConfig:any = {
		gutter: 'boolean',
		liveSplitters: 'boolean',
		persist: 'boolean'
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

BorderContainer.configureLayout(LayoutContainer);

export = BorderContainer;
