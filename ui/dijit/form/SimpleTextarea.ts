import _DijitWidget = require('dijit/form/SimpleTextarea');
import TextBox = require('./TextBox');
import util = require('../../../util');

class SimpleTextarea extends TextBox {
	static _dijitConfig:any = {
		rows: 'number',
		cols: 'number'
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

SimpleTextarea.configure(TextBox);

export = SimpleTextarea;
