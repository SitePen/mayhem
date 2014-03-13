import configure = require('../util/configure');
import layout = require('./interfaces');
import Dijit = require('dijit/layout/TabContainer');
import _TabContainerBase = require('./_TabContainerBase');

class TabContainer extends _TabContainerBase implements layout.ITabContainer {
	get:layout.ITabContainerGet;
	set:layout.ITabContainerSet;
}

configure(TabContainer, {
	Base: _TabContainerBase,
	Dijit: Dijit,
	schema: {
		useMenu: Boolean,
		useSlider: Boolean
		// controllerWidget
	}
});

export = TabContainer;
