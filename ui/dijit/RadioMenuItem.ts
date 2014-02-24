import CheckedMenuItem = require('./CheckedMenuItem');
import __RadioMenuItem = require('dijit/RadioMenuItem');

class RadioMenuItem extends CheckedMenuItem {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__RadioMenuItem);
		this._setDijitFields('group');
		super(kwArgs);
	}
}

export = RadioMenuItem;
