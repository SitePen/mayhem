import MockWidget = require('./Widget');
import ui = require('../../../ui/interfaces');

class MockWidgetFactory {
	static factoriesCreated = 0;

	constructor() {
		MockWidgetFactory.factoriesCreated++;
	}

	children:any[];

	create(options?:any):ui.IWidget {
		var child:any = new MockWidget();
		if (!this.children) {
			this.children = [];
		}
		this.children.push(child);
		return child;
	}
	_initializeArgs() {}
	_initializeContent() {}
	_initializeChildren() {}
}

export = MockWidgetFactory;
