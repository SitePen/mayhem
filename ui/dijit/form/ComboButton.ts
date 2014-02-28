import _DijitWidget = require('dijit/form/ComboButton');
import DropDownButton = require('./DropDownButton');

class ComboButton extends DropDownButton {
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

ComboButton.configure(DropDownButton);

export = ComboButton;
