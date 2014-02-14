import array = require('dojo/_base/array');
import DijitDropDownMenu = require('dijit/DropDownMenu');
import DijitWidget = require('./DijitWidget');
import DijitContainer = require('./DijitContainer');
import util = require('../../util');
import widgets = require('../interfaces');

class DropDownMenu extends DijitContainer {
	/* protected */ _dijit:DijitDropDownMenu;

	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(DijitDropDownMenu);
		super(kwArgs);
	}
}

export = DropDownMenu;
