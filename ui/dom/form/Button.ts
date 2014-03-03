import Control = require('./Control');
import _Dijit = require('../../dijit/form/Button');
import util = require('../../../util');

class Button extends Control {
	_label:string;
	_type:string;
}

util.applyMixins(Button, [ _Dijit ]);

export = Button;
