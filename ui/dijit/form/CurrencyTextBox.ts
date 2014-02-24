import __CurrencyTextBox = require('dijit/form/CurrencyTextBox');
import NumberTextBox = require('./NumberTextBox');

class CurrencyTextBox extends NumberTextBox {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__CurrencyTextBox);
		this._setDijitFields('currency');
		super(kwArgs);
	}
}

export = CurrencyTextBox;
