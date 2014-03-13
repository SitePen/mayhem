import configure = require('../util/configure');
import layout = require('./interfaces');
import Dijit = require('dijit/layout/LayoutContainer');
import _LayoutWidget = require('./_LayoutWidget');

class LayoutContainer extends _LayoutWidget implements layout.ILayoutContainer {
	get:layout.ILayoutWidgetGet;
	set:layout.ILayoutWidgetSet;
}

configure(LayoutContainer, {
	Base: _LayoutWidget,
	Dijit: Dijit,
	layoutSchema: {
		region: String,
		layoutPriority: Number
	},
	schema: {
		design: String
	}
});

export = LayoutContainer;
