import Dijit = require('../Dijit');
import _DijitCtor = require('dijit/form/RadioButton');

class RadioButton extends Dijit {
}

RadioButton.prototype._DijitCtor = _DijitCtor;
RadioButton.prototype._dijitFields = [ 'checked', 'value' ];
RadioButton.prototype._dijitActions = [ 'onClick' ];

export = RadioButton;
