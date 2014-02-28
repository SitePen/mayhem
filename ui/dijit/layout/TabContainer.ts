import _DijitWidget = require('dijit/layout/TabContainer');
import _TabContainerBase = require('./_TabContainerBase');

class TabContainer extends _TabContainerBase {
	static _dijitConfig:any = {
		useMenu: 'boolean',
		useSlider: 'boolean',
		// controllerWidget
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

TabContainer.configureLayout(_TabContainerBase);

export = TabContainer;
