import Button = require('./Button');
import _DijitWidget = require('dijit/form/DropDownButton');

class DropDownButton extends Button {
	static _dijitConfig:any = {
		dropDown: { child: '_dijit', required: true }
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

DropDownButton.configure(Button);

export = DropDownButton;
