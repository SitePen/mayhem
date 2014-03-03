import _Dijit = require('../../dijit/form/CheckBox');
import ToggleButton = require('./ToggleButton');
import util = require('../../../util');

class Checkbox extends ToggleButton {
	_indeterminate:boolean; // TODO
}

util.applyMixins(Checkbox, [ _Dijit ]);

export = Checkbox;