import Button = require('./Button');
import _DijitWidget = require('dijit/form/ToggleButton');

class ToggleButton extends Button {
	static _dijitConfig:any = {
		checked: 'boolean'
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

ToggleButton.configure(Button);

export = ToggleButton;
