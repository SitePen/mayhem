import __DateTextBox = require('dijit/form/DateTextBox');
import RangeBoundTextBox = require('./RangeBoundTextBox');

class DateTextBox extends RangeBoundTextBox {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__DateTextBox);
		super(kwArgs);
	}
}

export = DateTextBox;
