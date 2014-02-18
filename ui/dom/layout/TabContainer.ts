import __TabContainer = require('dijit/layout/TabContainer');
import StackContainer = require('./StackContainer')

class TabContainer extends StackContainer {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__TabContainer);
		super(kwArgs);
	}
}

export = TabContainer;
