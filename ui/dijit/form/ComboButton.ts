import _DijitCtor = require('dijit/form/ComboButton');
import DropDownButton = require('./DropDownButton');

class ComboButton extends DropDownButton {
}

ComboButton.prototype._DijitCtor = _DijitCtor;

export = ComboButton;
