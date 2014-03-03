import _DijitWidget = require('../../dijit/form/TextBox');
import Input = require('./Input');
import util = require('../../../util');

class TextInput extends Input {
	_maxLength:number; // TODO: maxlength
	_placeHolder:string; // TODO: placeholder
	_trim:boolean;
	_value:string;
}

util.applyMixins(TextInput, [ _DijitWidget ]);

export = TextInput;
