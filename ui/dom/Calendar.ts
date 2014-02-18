import __Calendar = require('dijit/Calendar');
import DijitWidget = require('./DijitWidget');

class Calendar extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__Calendar);
		super(kwArgs);
	}
}

export = Calendar;
