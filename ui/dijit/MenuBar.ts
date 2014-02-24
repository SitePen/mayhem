import Dijit = require('./Dijit');
import __MenuBar = require('dijit/MenuBar');

class MenuBar extends Dijit {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__MenuBar);
		super(kwArgs);
	}
}

export = MenuBar;
