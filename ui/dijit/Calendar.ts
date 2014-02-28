import CalendarLite = require('./CalendarLite');
import _DijitWidget = require('dijit/Calendar');

class Calendar extends CalendarLite { // , _Widget
	// TODO: _dijitConfig
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

Calendar.configure(CalendarLite);

export = Calendar;
