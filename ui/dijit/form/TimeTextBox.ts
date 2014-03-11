import configure = require('../configure');
import Dijit = require('dijit/form/TimeTextBox');
import form = require('./interfaces');
import RangeBoundTextBox = require('./RangeBoundTextBox');

class TimeTextBox extends RangeBoundTextBox {
	// TODO: interfaces
}

configure(TimeTextBox, {
	Base: RangeBoundTextBox,
	Dijit: Dijit,
	schema: {
		// TODO
	}
});

export = TimeTextBox;
