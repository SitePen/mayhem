import __TimeTextBox = require('dijit/form/TimeTextBox');
import RangeBoundTextBox = require('./RangeBoundTextBox');

class TimeTextBox extends RangeBoundTextBox {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__TimeTextBox);
		super(kwArgs);
	}
}

export = TimeTextBox;
