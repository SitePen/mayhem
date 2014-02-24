import Dijit = require('../Dijit')
import __StackContainer = require('dijit/layout/StackContainer');

class StackContainer extends Dijit {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__StackContainer);
		super(kwArgs);
	}
}

export = StackContainer;
