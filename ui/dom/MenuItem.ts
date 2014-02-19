import DijitWidget = require('./DijitWidget');
import __MenuItem = require('dijit/MenuItem');

class MenuItem extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__MenuItem);
		this._setDijitActions('onClick');
		super(kwArgs);
	}
}

export = MenuItem;
