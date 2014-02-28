import _DijitWidget = require('dijit/Menu');
import DropDownMenu = require('./DropDownMenu');

class Menu extends DropDownMenu {
	static _dijitConfig:any = {
		contextMenuForWindow: 'boolean',
		leftClickToOpen: 'boolean',
		refocus: 'boolean'
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

Menu.configure(DropDownMenu);

export = Menu;
