import DijitCtor = require('dijit/form/RadioButton');
import CheckBox = require('./CheckBox');

class RadioButton extends CheckBox {
}

RadioButton.prototype.DijitCtor = DijitCtor;

export = RadioButton;
