import DijitCtor = require('dijit/form/CheckBox');
import ToggleButton = require('./ToggleButton');

class CheckBox extends ToggleButton {
}

CheckBox.prototype.DijitCtor = DijitCtor;

export = CheckBox;
