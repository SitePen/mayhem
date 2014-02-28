import _DijitWidget = require('dijit/form/RangeBoundTextBox');
import TextBox = require('./TextBox');

class RangeBoundTextBox extends TextBox {
	// TODO: _dijitConfig
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

RangeBoundTextBox.configure(TextBox);

export = RangeBoundTextBox;
