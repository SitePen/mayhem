import Dijit = require('./Dijit');
import __MenuSeparator = require('dijit/MenuSeparator');

class MenuSeparator extends Dijit {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__MenuSeparator);
		super(kwArgs);
	}
}

export = MenuSeparator;
