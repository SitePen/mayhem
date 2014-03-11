import configure = require('./configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/MenuItem');
import _Widget = require('./_Widget');

class MenuItem extends _Widget {
	// TODO: interfaces
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
