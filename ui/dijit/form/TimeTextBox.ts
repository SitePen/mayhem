import _DijitCtor = require('dijit/form/TimeTextBox');
import RangeBoundTextBox = require('./RangeBoundTextBox');

class TimeTextBox extends RangeBoundTextBox {
}

TimeTextBox.prototype._DijitCtor = _DijitCtor;

export = TimeTextBox;
