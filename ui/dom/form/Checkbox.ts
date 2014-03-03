import DijitCheckBox = require('../../dijit/form/CheckBox');
import form = require('./interfaces');
import ToggleButton = require('./ToggleButton');
import util = require('../../../util');

class Checkbox extends ToggleButton implements form.ICheckbox {
	_indeterminate:boolean; // TODO
}

util.applyMixins(Checkbox, [ DijitCheckBox ]);

export = Checkbox;
