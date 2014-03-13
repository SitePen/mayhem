import configure = require('../util/configure');
import Dijit = require('dijit/form/NumberTextBox');
import form = require('./interfaces');
import RangeBoundTextBox = require('./RangeBoundTextBox');

class NumberTextBox extends RangeBoundTextBox {
	// TODO: interfaces
}

configure(NumberTextBox, {
	Base: RangeBoundTextBox,
	Dijit: Dijit,
	schema: {
		// TODO
	}
});

export = NumberTextBox;
