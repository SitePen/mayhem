import CheckBox = require('./CheckBox');
import _DijitWidget = require('dijit/form/RadioButton');

class RadioButton extends CheckBox {
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

RadioButton.configure(CheckBox);

export = RadioButton;
