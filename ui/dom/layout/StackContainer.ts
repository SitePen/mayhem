import DijitWidget = require('../DijitWidget')
import __StackContainer = require('dijit/layout/StackContainer');

class StackContainer extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__StackContainer);
		super(kwArgs);
	}
}

export = StackContainer;
