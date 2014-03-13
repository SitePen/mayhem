import configure = require('./util/configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/MenuItem');
import _Widget = require('./_Widget');

class MenuItem extends _Widget implements dijit.IMenuItem {
	get:dijit.IMenuItemGet;
	set:dijit.IMenuItemSet;
}

configure(MenuItem, {
	Base: _Widget,
	Dijit: Dijit,
	schema: {
		label: String,
		iconClass: String,
		accelKey: String,
		disabled: Boolean,
		onClick: Function
	}
});

export = MenuItem;
