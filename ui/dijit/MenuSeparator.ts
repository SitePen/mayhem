import configure = require('./configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/MenuSeparator');
import _WidgetBase = require('./_WidgetBase');

class MenuSeparator extends _WidgetBase {
	// TODO: interfaces
}

configure(MenuSeparator, {
	Base: _WidgetBase,
	Dijit: Dijit
});

export = MenuSeparator;
