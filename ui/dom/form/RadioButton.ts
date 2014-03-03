import Checkbox = require('./Checkbox');
import _DijitWidget = require('../../dijit/form/RadioButton');
import util = require('../../../util');

class RadioButton extends Checkbox {
	_group:string;
}

util.applyMixins(RadioButton, [ _DijitWidget ]);

export = RadioButton;
