import _DijitWidget = require('dijit/form/CurrencyTextBox');
import NumberTextBox = require('./NumberTextBox');

class CurrencyTextBox extends NumberTextBox {
	static _dijitConfig:any = {
		currency: 'boolean'
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

// TODO: catalog textboxes
CurrencyTextBox.configure(NumberTextBox);

export = CurrencyTextBox;
