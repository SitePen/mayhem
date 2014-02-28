import _DijitWidget = require('dijit/CalendarLite');
import _WidgetBase = require('./_WidgetBase');

class CalendarLight extends _WidgetBase {
	// TODO: _dijitConfig
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

CalendarLight.configure(_WidgetBase);

export = CalendarLight;
