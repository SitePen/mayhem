import configure = require('../configure');
import Dijit = require('dijit/form/CurrencyTextBox');
import form = require('./interfaces');
import NumberTextBox = require('./NumberTextBox');

class CurrencyTextBox extends NumberTextBox {
	// TODO: interfaces
}

configure(CurrencyTextBox, {
	Base: NumberTextBox,
	Dijit: Dijit,
	schema: {
		currency: Boolean
	}
});

export = CurrencyTextBox;
