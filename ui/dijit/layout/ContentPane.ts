import __ContentPane = require('dijit/layout/ContentPane');
import Dijit = require('../Dijit');

class ContentPane extends Dijit {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__ContentPane);
		this._setDijitFields('title', 'selected', 'closable');
		super(kwArgs);
	}
}

export = ContentPane;
