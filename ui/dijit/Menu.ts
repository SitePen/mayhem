import configure = require('./configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/Menu');
import DropDownMenu = require('./DropDownMenu');

class Menu extends DropDownMenu {
	// TODO: interfaces
}

configure(Menu, {
	Base: DropDownMenu,
	Dijit: Dijit,
	schema: {
		contextMenuForWindow: Boolean,
		leftClickToOpen: Boolean,
		refocus: Boolean
	}
});

export = Menu;
