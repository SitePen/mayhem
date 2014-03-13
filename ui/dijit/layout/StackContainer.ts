import configure = require('../util/configure');
import layout = require('./interfaces');
import Dijit = require('dijit/layout/StackContainer');
import _LayoutWidget = require('./_LayoutWidget');

class StackContainer extends _LayoutWidget implements layout.IStackContainer {
	get:layout.IStackContainerGet;
	set:layout.IStackContainerSet;
}

configure(StackContainer, {
	Base: _LayoutWidget,
	Dijit: Dijit,
	layoutSchema: {
		selected: Boolean,
		disabled: Boolean,
		closable: Boolean,
		iconClass: String,
		showTitle: Boolean
	}
});

export = StackContainer;
