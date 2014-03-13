import configure = require('../util/configure');
import layout = require('./interfaces');
import Dijit = require('dijit/layout/BorderContainer');
import LayoutContainer = require('./LayoutContainer');

class BorderContainer extends LayoutContainer implements layout.IBorderContainer {
	get:layout.IBorderContainerGet;
	set:layout.IBorderContainerSet;
}

configure(BorderContainer, {
	Base: LayoutContainer,
	Dijit: Dijit,
	layoutSchema: {
		splitter: Boolean,
		minSize: Number,
		maxSize: Number
	},
	schema: {
		gutter: Boolean,
		liveSplitters: Boolean,
		persist: Boolean
	}
});

export = BorderContainer;
