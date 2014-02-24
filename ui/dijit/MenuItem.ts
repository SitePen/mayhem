import Dijit = require('./Dijit');
import __MenuItem = require('dijit/MenuItem');

class MenuItem extends Dijit {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__MenuItem);
		this._setDijitActions('onClick');
		super(kwArgs);
	}
}

export = MenuItem;
