import __Calendar = require('dijit/Calendar');
import Dijit = require('./Dijit');

class Calendar extends Dijit {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__Calendar);
		super(kwArgs);
	}
}

export = Calendar;
