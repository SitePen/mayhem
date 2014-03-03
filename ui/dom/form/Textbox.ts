import Control = require('./Control');
import DijitTextBox = require('../../dijit/form/TextBox');
import form = require('./interfaces');
import util = require('../../../util');

class Textbox extends Control implements form.ITextbox {
	_maxLength:number;
	_placeHolder:string;
	_trim:boolean;
	_value:string;
}

util.applyMixins(Textbox, [ DijitTextBox ]);

export = Textbox;
