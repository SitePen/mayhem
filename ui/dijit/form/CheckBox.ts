import Dijit = require('../Dijit');
import _DijitCtor = require('dijit/form/CheckBox');

class CheckBox extends Dijit {
}

CheckBox.prototype._DijitCtor = _DijitCtor;
CheckBox.prototype._dijitFields = [ 'checked', 'value' ];
CheckBox.prototype._dijitActions = [ 'onClick' ];

export = CheckBox;
