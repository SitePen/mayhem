import PopupMenuItem = require('./PopupMenuItem');
import __PopupMenuBarItem = require('dijit/PopupMenuBarItem');

class PopupMenuBarItem extends PopupMenuItem {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__PopupMenuBarItem);
		super(kwArgs);
	}
}

export = PopupMenuBarItem;
