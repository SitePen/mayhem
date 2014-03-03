import _DijitWidget = require('../../dijit/form/ToggleButton');
import Button = require('./Button');
import util = require('../../../util');

class ToggleButton extends Button {
	_checked:boolean;
}

util.applyMixins(ToggleButton, [ _DijitWidget ]);

export = ToggleButton;
