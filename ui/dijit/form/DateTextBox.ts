import configure = require('../configure');
import Dijit = require('dijit/form/DateTextBox');
import form = require('./interfaces');
import RangeBoundTextBox = require('./RangeBoundTextBox');

class DateTextBox extends RangeBoundTextBox {
	// TODO: interfaces
}

configure(DateTextBox, {
	Base: RangeBoundTextBox,
	Dijit: Dijit,
	schema: {
		// TODO
	}
});

export = DateTextBox;
