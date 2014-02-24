import ContentPane = require('./ContentPane');
import __TitlePane = require('dijit/TitlePane');

class TitlePane extends ContentPane {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__TitlePane);
		super(kwArgs);
	}
}

export = TitlePane;
