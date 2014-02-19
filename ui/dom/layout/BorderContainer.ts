import __BorderContainer = require('dijit/layout/BorderContainer');
import LayoutContainer = require('./LayoutContainer');

class BorderContainer extends LayoutContainer {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__BorderContainer);
		this._setDijitFields('gutters', 'liveSplitters', 'persist'); // TODO
		super(kwArgs);
	}
}

export = BorderContainer;
