import configure = require('../configure');
import layout = require('./interfaces');
import _Widget = require('../_Widget');

class _LayoutWidget extends _Widget implements layout.ILayoutWidget { // TODO: implements _Container, _Contained
	get:layout.ILayoutWidgetGet;
	set:layout.ILayoutWidgetSet;
}

configure(_LayoutWidget, {
	Base: _Widget
});

export = _LayoutWidget;
