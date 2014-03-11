import configure = require('../configure');
import layout = require('./interfaces');
import StackContainer = require('./StackContainer');

class _TabContainerBase extends StackContainer implements layout.ITabContainerBase {
	get:layout.ITabContainerBaseGet;
	set:layout.ITabContainerBaseSet;
}

configure(_TabContainerBase, {
	Base: StackContainer,
	schema: {
		tabPosition: String,
		tabStrip: Boolean,
		nested: Boolean
	}
});

export = _TabContainerBase;
