import CalendarLite = require('./CalendarLite');
import configure = require('./util/configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/Calendar');

class Calendar extends CalendarLite { // _Widget
	// TODO: intefaces
}

configure(Calendar, {
	Base: CalendarLite,
	Dijit: Dijit,
	schema: {
		// TODO
	}
});

export = Calendar;
