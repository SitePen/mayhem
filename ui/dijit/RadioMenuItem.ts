import CheckedMenuItem = require('./CheckedMenuItem');
import configure = require('./util/configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/RadioMenuItem');

class RadioMenuItem extends CheckedMenuItem {
	// TODO: interfaces
}

configure(RadioMenuItem, {
	Base: CheckedMenuItem,
	Dijit: Dijit,
	schema: {
		checkedChar: String,
		group: String,
		onClick: Function
	}
});

export = RadioMenuItem;
