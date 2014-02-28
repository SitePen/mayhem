import _DijitWidget = require('dijit/MenuItem');
import _Widget = require('./_Widget');

class MenuItem extends _Widget {
	static _dijitConfig:any = {
		label: 'string',
		iconClass: 'string',
		accelKey: 'string',
		disabled: 'boolean',
		onClick: { action: true }
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

MenuItem.configure(_Widget);

export = MenuItem;
