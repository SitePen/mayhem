import __NumberTextBox = require('dijit/form/NumberTextBox');
import RangeBoundTextBox = require('./RangeBoundTextBox');

class NumberTextBox extends RangeBoundTextBox {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__NumberTextBox);
		super(kwArgs);
	}
}

export = NumberTextBox;
