import RangeBoundTextBox = require('./RangeBoundTextBox');
import __TimeTextBox = require('dijit/form/TimeTextBox');

class TimeTextBox extends RangeBoundTextBox {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__TimeTextBox);
		super(kwArgs);
	}
}

export = TimeTextBox;
