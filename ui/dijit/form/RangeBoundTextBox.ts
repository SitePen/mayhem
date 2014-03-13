import configure = require('../util/configure');
import Dijit = require('dijit/form/RangeBoundTextBox');
import form = require('./interfaces');
import TextBox = require('./TextBox');

class RangeBoundTextBox extends TextBox {
	// TODO: interfaces
}

configure(RangeBoundTextBox, {
	Base: TextBox,
	Dijit: Dijit,
	schema: {
		// TODO
	}
});

export = RangeBoundTextBox;
