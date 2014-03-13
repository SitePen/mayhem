import configure = require('./util/configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/PopupMenuBarItem');
import PopupMenuItem = require('./PopupMenuItem');

class PopupMenuBarItem extends PopupMenuItem {
	// TODO: interfaces
}

configure(PopupMenuBarItem, {
	Base: PopupMenuItem,
	Dijit: Dijit
});

export = PopupMenuBarItem;
