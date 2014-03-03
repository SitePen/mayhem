import _DijitWidget = require('../../dijit/form/SimpleTextarea');
import TextInput = require('./TextInput');
import util = require('../../../util');

class Textarea extends TextInput {
	_cols:number;
	_rows:number;
}

util.applyMixins(Textarea, [ _DijitWidget ]);

export = Textarea;
