import DijitSimpleTextarea = require('../../dijit/form/SimpleTextarea');
import form = require('./interfaces');
import Textbox = require('./Textbox');
import util = require('../../../util');

class Textarea extends Textbox implements form.ITextarea {
	_cols:number;
	_rows:number;
}

util.applyMixins(Textarea, [ DijitSimpleTextarea ]);

export = Textarea;
