import configure = require('./util/configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/PopupMenuItem');
import MenuItem = require('./MenuItem');
import _WidgetBase = require('./_WidgetBase');

class PopupMenuItem extends MenuItem implements dijit.IPopupMenuItem {
	get:dijit.IPopupMenuItemGet;
	set:dijit.IPopupMenuItemSet;
}

configure(PopupMenuItem, {
	Base: MenuItem,
	Dijit: Dijit,
	schema: {
		popup: { type: _WidgetBase, required: true }
	}
});

export = PopupMenuItem;
