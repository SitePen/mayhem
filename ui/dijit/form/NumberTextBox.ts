import _DijitCtor = require('dijit/form/NumberTextBox');
import RangeBoundTextBox = require('./RangeBoundTextBox');

class NumberTextBox extends RangeBoundTextBox {
}

NumberTextBox.prototype._DijitCtor = _DijitCtor;

export = NumberTextBox;
