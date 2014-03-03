import Checkbox = require('./Checkbox');
import _Dijit = require('../../dijit/form/CheckBox');
import util = require('../../../util');

class RadioButton extends Checkbox {
	_group:string;
}

util.applyMixins(RadioButton, [ _Dijit ]);

export = RadioButton;
