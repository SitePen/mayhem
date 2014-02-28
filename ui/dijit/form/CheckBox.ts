import _DijitWidget = require('dijit/form/CheckBox');
import ToggleButton = require('./ToggleButton');

class CheckBox extends ToggleButton {
	static _dijitConfig:any = {
		// _CheckBoxMixin
		readOnly: 'boolean'
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

CheckBox.configure(ToggleButton);

export = CheckBox;
