import Dijit = require('../Dijit')
import __LayoutContainer = require('dijit/layout/LayoutContainer');

class LayoutContainer extends Dijit {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__LayoutContainer);
		this._setDijitFields('design');
		super(kwArgs);
	}
}

export = LayoutContainer;
