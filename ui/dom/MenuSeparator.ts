import DijitWidget = require('./DijitWidget');
import __MenuSeparator = require('dijit/MenuSeparator');

class MenuSeparator extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__MenuSeparator);
		super(kwArgs);
	}
}

export = MenuSeparator;
