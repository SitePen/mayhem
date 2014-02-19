import Input = require('./Input');
import __RangeBoundTextBox = require('dijit/form/RangeBoundTextBox');

class RangeBoundTextBox extends Input {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__RangeBoundTextBox);
		this._setDijitFields('rangeMessage');
		// TODO: constraints -> (min, max, places, pattern)
		super(kwArgs);
	}
}

export = RangeBoundTextBox;
