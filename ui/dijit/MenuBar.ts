import configure = require('./configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/MenuBar');
import _MenuBase = require('./_MenuBase');

class MenuBar extends _MenuBase {
	// TODO: interfaces
}

configure(MenuBar, {
	Base: _MenuBase,
	Dijit: Dijit,
	schema: {
		popupDelay: Number,
		onItemClick: Function
	}
});

export = MenuBar;
