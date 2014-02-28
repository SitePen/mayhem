import CheckedMenuItem = require('./CheckedMenuItem');
import _DijitWidget = require('dijit/RadioMenuItem');

class RadioMenuItem extends CheckedMenuItem {
	static _dijitConfig:any = {
		checkedChar: 'string',
		group: 'string',
		onClick: { action: true }
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

RadioMenuItem.configure(CheckedMenuItem);

export = RadioMenuItem;
