import Control = require('./Control');
import DijitButton = require('../../dijit/form/Button');
import form = require('./interfaces');
import util = require('../../../util');

class Button extends Control implements form.IButton {
	_label:string;
	_type:string;
}

util.applyMixins(Button, [ DijitButton ]);

export = Button;
