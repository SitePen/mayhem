import configure = require('./configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/PopupMenuItem');
import MenuItem = require('./MenuItem');

class PopupMenuItem extends MenuItem {
	// TODO: interfaces
}

configure(PopupMenuItem, {
	Base: MenuItem,
	Dijit: Dijit,
	schema: {
		popup: { child: '_dijit', required: true }
	}
});

export = PopupMenuItem;
