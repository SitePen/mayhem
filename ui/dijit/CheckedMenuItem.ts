import configure = require('./util/configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/CheckedMenuItem');
import MenuItem = require('./MenuItem');

class CheckedMenuItem extends MenuItem {
	// TODO: intefaces
}

configure(CheckedMenuItem, {
	Base: MenuItem,
	Dijit: Dijit,
	schema: {
		checked: Boolean,
		checkedChar: String
	}
});

export = CheckedMenuItem;
