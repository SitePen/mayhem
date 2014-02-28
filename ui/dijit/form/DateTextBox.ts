import _DijitCtor = require('dijit/form/DateTextBox');
import RangeBoundTextBox = require('./RangeBoundTextBox');

class DateTextBox extends RangeBoundTextBox {
}

DateTextBox.prototype._DijitCtor = _DijitCtor;

export = DateTextBox;
