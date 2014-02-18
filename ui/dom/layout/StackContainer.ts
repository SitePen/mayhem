import __StackContainer = require('dijit/layout/StackContainer');
import DijitWidget = require('../DijitWidget')

class StackContainer extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__StackContainer);
		super(kwArgs);
	}
}

export = StackContainer;
