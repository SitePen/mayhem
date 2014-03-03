import DijitToggleButton = require('../../dijit/form/ToggleButton');
import form = require('./interfaces');
import Button = require('./Button');
import util = require('../../../util');

class ToggleButton extends Button implements form.IToggleButton {
	_checked:boolean;
}

util.applyMixins(ToggleButton, [ DijitToggleButton ]);

export = ToggleButton;
