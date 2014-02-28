import _DijitCtor = require('dijit/form/CurrencyTextBox');
import NumberTextBox = require('./NumberTextBox');

class CurrencyTextBox extends NumberTextBox {
}

CurrencyTextBox.prototype._DijitCtor = _DijitCtor;
CurrencyTextBox.prototype._dijitFields = [ 'currency' ];

export = CurrencyTextBox;
