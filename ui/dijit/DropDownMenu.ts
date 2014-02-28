import _DijitWidget = require('dijit/DropDownMenu');
import _MenuBase = require('./_MenuBase');

class DropDownMenu extends _MenuBase {
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

DropDownMenu.configure(_MenuBase);

export = DropDownMenu;
