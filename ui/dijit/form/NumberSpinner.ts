import _DijitCtor = require('dijit/form/NumberSpinner');
import NumberTextBox = require('./NumberTextBox');

class NumberSpinner extends NumberTextBox {
}

NumberSpinner.prototype._DijitCtor = _DijitCtor;
NumberSpinner.prototype._dijitFields = [ 'largeDelta', 'smallDelta' ];

export = NumberSpinner;
