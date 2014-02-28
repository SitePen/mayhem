import _DijitWidget = require('dijit/form/NumberTextBox');
import RangeBoundTextBox = require('./RangeBoundTextBox');

class NumberTextBox extends RangeBoundTextBox {
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

// TODO: catalog textboxes
NumberTextBox.configure(RangeBoundTextBox);

export = NumberTextBox;
