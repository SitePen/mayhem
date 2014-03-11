import configure = require('./configure');
import dijit = require('./interfaces');
import _WidgetBase = require('./_WidgetBase');

class _Widget extends _WidgetBase implements dijit.IWidget {
	get:dijit.IWidgetGet;
	set:dijit.IWidgetSet;
}

configure(_Widget, {
	Base: _WidgetBase
});

export = _Widget;
