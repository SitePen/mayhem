/// <reference path="../../dojo" />

import DijitMenuItem = require('dijit/MenuItem');
import DijitWidget = require('./DijitWidget');

class MenuItem extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(DijitMenuItem);
		this._setDijitActions('onClick');
		super(kwArgs);
	}
}

export = MenuItem;
