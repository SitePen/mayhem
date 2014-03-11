import configure = require('./configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/DropDownMenu');
import _MenuBase = require('./_MenuBase');

class DropDownMenu extends _MenuBase {
	// TODO: interfaces
}

configure(DropDownMenu, {
	Base: _MenuBase,
	Dijit: Dijit
});

export = DropDownMenu;
