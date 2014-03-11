import configure = require('./configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/CalendarLite');
import _WidgetBase = require('./_WidgetBase');

class CalendarLight extends _WidgetBase {
	// TODO: interfaces
}

configure(CalendarLight, {
	Base: _WidgetBase,
	Dijit: Dijit,
	schema: {
		// TODO
	}
});

export = CalendarLight;
