import Control = require('./Control');
import _DijitWidget = require('../../dijit/form/Button');
import util = require('../../../util');

class Button extends Control {
	_label:string;
	_type:string;
}

util.applyMixins(Button, [ _DijitWidget ]);

export = Button;
