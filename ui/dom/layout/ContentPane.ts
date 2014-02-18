import __ContentPane = require('dijit/layout/ContentPane');
import DijitWidget = require('../DijitWidget');

class ContentPane extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__ContentPane);
		this._setDijitFields('title', 'selected', 'closable');
		super(kwArgs);
	}
}

export = ContentPane;
