import _DijitCtor = require('dijit/form/RangeBoundTextBox');
import TextBox = require('./TextBox');

class RangeBoundTextBox extends TextBox {
}

RangeBoundTextBox.prototype._DijitCtor = _DijitCtor;
RangeBoundTextBox.prototype._dijitFields = [ 'rangeMessage' ];
// TODO: constraints -> (min, max, places, pattern)

export = RangeBoundTextBox;
