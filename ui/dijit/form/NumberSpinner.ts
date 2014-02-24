import __NumberSpinner = require('dijit/form/NumberSpinner');
import NumberTextBox = require('./NumberTextBox');

class NumberSpinner extends NumberTextBox {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__NumberSpinner);
		this._setDijitFields('largeDelta', 'smallDelta');
		super(kwArgs);
	}
}

export = NumberSpinner;
