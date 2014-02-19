import StackContainer = require('./StackContainer')
import __TabContainer = require('dijit/layout/TabContainer');

class TabContainer extends StackContainer {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__TabContainer);
		this._setDijitFields('tabPosition', 'tabStrip');
		super(kwArgs);
	}
}

export = TabContainer;
