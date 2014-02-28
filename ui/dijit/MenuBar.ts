import _DijitWidget = require('dijit/MenuBar');
import _MenuBase = require('./_MenuBase');

class MenuBar extends _MenuBase {
	static _dijitConfig:any = {
		popupDelay: 'number',
		onItemClick: { action: true }
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

MenuBar.configure(_MenuBase);

export = MenuBar;
