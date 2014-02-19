import DijitWidget = require('../DijitWidget')
import __LayoutContainer = require('dijit/layout/LayoutContainer');

class LayoutContainer extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__LayoutContainer);
		this._setDijitFields('design');
		super(kwArgs);
	}
}

export = LayoutContainer;