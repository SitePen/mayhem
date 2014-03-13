import configure = require('./util/configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/MenuBarItem');
import MenuItem = require('./MenuItem');

class MenuBarItem extends MenuItem {
	// TODO: interfaces
}

configure(MenuBarItem, {
	Base: MenuItem,
	Dijit: Dijit,
	schema: {
		contextMenuForWindow: Boolean,
		leftClickToOpen: Boolean,
		refocus: Boolean
	}
});

export = MenuBarItem;
