import _DijitWidget = require('dijit/form/DateTextBox');
import RangeBoundTextBox = require('./RangeBoundTextBox');

class DateTextBox extends RangeBoundTextBox {
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

export = DateTextBox;

// TODO: catalog textboxes
DateTextBox.configure(RangeBoundTextBox);
