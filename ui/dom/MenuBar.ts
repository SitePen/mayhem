import DijitWidget = require('./DijitWidget');
import __MenuBar = require('dijit/MenuBar');

class MenuBar extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__MenuBar);
		super(kwArgs);
	}
}

export = MenuBar;
